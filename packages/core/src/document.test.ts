import { expect, test } from "vite-plus/test";
import type { ListNode, ParagraphNode } from "./documents";
import { compile } from "./documents";
import type { PrivacyPolicyConfig } from "./types";

const minimalPrivacyConfig: PrivacyPolicyConfig = {
	effectiveDate: "2026-01-01",
	company: {
		name: "Acme Inc.",
		legalName: "Acme Corporation",
		address: "123 Main St, Springfield, USA",
		contact: "privacy@acme.com",
	},
	data: {
		collected: { "Account Information": ["Name", "Email address"] },
		purposes: { "Account Information": "To authenticate users and send service notifications" },
		lawfulBasis: { "Account Information": "contract" },
		retention: { "Account Information": "Until account deletion" },
	},
	cookies: {
		used: { essential: true, analytics: false, marketing: false },
		lawfulBasis: { essential: "legal_obligation", analytics: "consent", marketing: "consent" },
	},
	thirdParties: [],
	userRights: ["access"],
	jurisdictions: ["ca"],
};

test("compile returns a Document with correct type", () => {
	const doc = compile({ type: "privacy", ...minimalPrivacyConfig });
	expect(doc.policyType).toBe("privacy");
	expect(Array.isArray(doc.sections)).toBe(true);
});

test("privacy compile returns non-empty sections", () => {
	const doc = compile({ type: "privacy", ...minimalPrivacyConfig });
	expect(doc.sections.length).toBeGreaterThan(0);
});

test("Reserved-region config has expected section IDs (no EU/UK/CA-only sections)", () => {
	const doc = compile({ type: "privacy", ...minimalPrivacyConfig });
	const ids = doc.sections.map((s) => s.id);
	expect(ids).toContain("introduction");
	expect(ids).toContain("data-collected");
	expect(ids).toContain("data-retention");
	expect(ids).toContain("cookies");
	expect(ids).toContain("third-parties");
	expect(ids).toContain("user-rights");
	expect(ids).toContain("contact");
	expect(ids).not.toContain("legal-basis");
	expect(ids).not.toContain("gdpr-supplement");
	expect(ids).not.toContain("uk-gdpr-supplement");
	expect(ids).not.toContain("ccpa-supplement");
});

test("EU config includes legal-basis and gdpr-supplement", () => {
	const doc = compile({
		type: "privacy",
		...minimalPrivacyConfig,
		jurisdictions: ["eu"],
	});
	const ids = doc.sections.map((s) => s.id);
	expect(ids).toContain("legal-basis");
	expect(ids).toContain("gdpr-supplement");
	expect(ids).not.toContain("uk-gdpr-supplement");
});

test("UK config includes legal-basis and uk-gdpr-supplement (not gdpr-supplement)", () => {
	const doc = compile({
		type: "privacy",
		...minimalPrivacyConfig,
		jurisdictions: ["uk"],
	});
	const ids = doc.sections.map((s) => s.id);
	expect(ids).toContain("legal-basis");
	expect(ids).toContain("uk-gdpr-supplement");
	expect(ids).not.toContain("gdpr-supplement");
	const ukSection = doc.sections.find((s) => s.id === "uk-gdpr-supplement")!;
	const textBlob = JSON.stringify(ukSection);
	expect(textBlob).toContain("Information Commissioner");
	expect(textBlob).toContain("Data Protection Act 2018");
});

test("US-CA config includes ccpa-supplement", () => {
	const doc = compile({
		type: "privacy",
		...minimalPrivacyConfig,
		jurisdictions: ["us-ca"],
	});
	const ids = doc.sections.map((s) => s.id);
	expect(ids).toContain("ccpa-supplement");
});

test("CA (Canada) alone does not include ccpa-supplement or gdpr-supplement", () => {
	const doc = compile({
		type: "privacy",
		...minimalPrivacyConfig,
		jurisdictions: ["ca"],
	});
	const ids = doc.sections.map((s) => s.id);
	expect(ids).not.toContain("ccpa-supplement");
	expect(ids).not.toContain("gdpr-supplement");
	expect(ids).not.toContain("uk-gdpr-supplement");
});

test("children-privacy section absent when children not set", () => {
	const doc = compile({ type: "privacy", ...minimalPrivacyConfig });
	const ids = doc.sections.map((s) => s.id);
	expect(ids).not.toContain("children-privacy");
});

test("children-privacy section present when children is set", () => {
	const doc = compile({
		type: "privacy",
		...minimalPrivacyConfig,
		children: { underAge: 13 },
	});
	const ids = doc.sections.map((s) => s.id);
	expect(ids).toContain("children-privacy");
});

test("children-privacy has noticeUrl link when provided", () => {
	const doc = compile({
		type: "privacy",
		...minimalPrivacyConfig,
		children: { underAge: 13, noticeUrl: "https://acme.com/children" },
	});
	const section = doc.sections.find((s) => s.id === "children-privacy")!;
	expect(section.content.length).toBe(3); // heading + 2 paragraphs
	const secondPara = section.content[2];
	expect(secondPara?.type).toBe("paragraph");
	const children = (secondPara as ParagraphNode).children;
	const linkNode = children.find((c) => c.type === "link");
	expect(linkNode).toBeDefined();
});

test("compile throws when data.collected is empty", () => {
	expect(() =>
		compile({
			type: "privacy",
			...minimalPrivacyConfig,
			data: { collected: {}, purposes: {}, lawfulBasis: {}, retention: {} },
		}),
	).toThrow(/no data collected/i);
});

test("data-collected section lists at least one category", () => {
	const doc = compile({ type: "privacy", ...minimalPrivacyConfig });
	const s = doc.sections.find((x) => x.id === "data-collected")!;
	const list = s.content.find((n) => n.type === "list") as ListNode;
	expect(list.items.length).toBeGreaterThan(0);
});

test("data-collected section includes purpose paragraph for each category", () => {
	const doc = compile({
		type: "privacy",
		...minimalPrivacyConfig,
		data: {
			collected: {
				"Account Information": ["Name", "Email"],
				"Session Data": ["IP address"],
			},
			purposes: {
				"Account Information": "To authenticate users",
				"Session Data": "To secure sessions",
			},
			lawfulBasis: {
				"Account Information": "contract",
				"Session Data": "legitimate_interests",
			},
			retention: {
				"Account Information": "Until account deletion",
				"Session Data": "30 days",
			},
		},
	});
	const s = doc.sections.find((x) => x.id === "data-collected")!;
	const blob = JSON.stringify(s);
	expect(blob).toContain("To authenticate users");
	expect(blob).toContain("To secure sessions");
	expect(blob).toContain("Purpose:");
});

test("gdpr-supplement mentions DPO when one is configured", () => {
	const doc = compile({
		type: "privacy",
		...minimalPrivacyConfig,
		jurisdictions: ["eu"],
		company: {
			...minimalPrivacyConfig.company,
			dpo: { email: "dpo@acme.com", name: "Jane Doe", phone: "+1 555 010 2030" },
		},
	});
	const gdpr = doc.sections.find((s) => s.id === "gdpr-supplement")!;
	const blob = JSON.stringify(gdpr);
	expect(blob).toContain("Data Protection Officer");
	expect(blob).toContain("dpo@acme.com");
	expect(blob).toContain("Jane Doe");
	expect(blob).toContain("+1 555 010 2030");
});

test("gdpr-supplement states no DPO when company.dpo.required === false", () => {
	const doc = compile({
		type: "privacy",
		...minimalPrivacyConfig,
		jurisdictions: ["eu"],
		company: {
			...minimalPrivacyConfig.company,
			dpo: { required: false, reason: "Small-scale processing only." },
		},
	});
	const gdpr = doc.sections.find((s) => s.id === "gdpr-supplement")!;
	const blob = JSON.stringify(gdpr);
	expect(blob).toContain("have not appointed a Data Protection Officer");
	expect(blob).toContain("Article 37(1)");
	expect(blob).toContain("Small-scale processing only.");
});

test("gdpr-supplement falls back to no-DPO disclosure when unset", () => {
	const doc = compile({
		type: "privacy",
		...minimalPrivacyConfig,
		jurisdictions: ["eu"],
	});
	const gdpr = doc.sections.find((s) => s.id === "gdpr-supplement")!;
	const blob = JSON.stringify(gdpr);
	expect(blob).toContain("Data Protection Officer");
	expect(blob).toContain("Article 37(1)");
});

test("uk-gdpr-supplement includes DPO contact when configured", () => {
	const doc = compile({
		type: "privacy",
		...minimalPrivacyConfig,
		jurisdictions: ["uk"],
		company: {
			...minimalPrivacyConfig.company,
			dpo: { email: "dpo@acme.co.uk" },
		},
	});
	const uk = doc.sections.find((s) => s.id === "uk-gdpr-supplement")!;
	const blob = JSON.stringify(uk);
	expect(blob).toContain("Data Protection Officer");
	expect(blob).toContain("dpo@acme.co.uk");
});

test("contact section lists DPO when configured", () => {
	const doc = compile({
		type: "privacy",
		...minimalPrivacyConfig,
		company: {
			...minimalPrivacyConfig.company,
			dpo: { email: "dpo@acme.com", name: "Jane Doe" },
		},
	});
	const contact = doc.sections.find((s) => s.id === "contact")!;
	const blob = JSON.stringify(contact);
	expect(blob).toContain("Data Protection Officer");
	expect(blob).toContain("dpo@acme.com");
});

test("introduction section has ParagraphNode children", () => {
	const doc = compile({ type: "privacy", ...minimalPrivacyConfig });
	const intro = doc.sections.find((s) => s.id === "introduction")!;
	expect(intro.content.length).toBeGreaterThan(0);
	const firstNode = intro.content[0];
	expect(firstNode?.type).toBe("heading");
	const firstPara = intro.content[1] as ParagraphNode;
	expect(firstPara.children.length).toBeGreaterThan(0);
	expect(firstPara.children[0]?.type).toBe("text");
});

test("legal-basis section renders one block per data category with Article 6 sub-clause", () => {
	const doc = compile({
		type: "privacy",
		...minimalPrivacyConfig,
		jurisdictions: ["eu"],
		data: {
			collected: {
				"Personal Information": ["Name", "Email"],
				"Marketing Data": ["Mailing list signup"],
			},
			purposes: {
				"Personal Information": "Providing the service",
				"Marketing Data": "Marketing communications",
			},
			lawfulBasis: {
				"Personal Information": "contract",
				"Marketing Data": "consent",
			},
			retention: {
				"Personal Information": "Until account deletion",
				"Marketing Data": "Until consent is withdrawn",
			},
		},
	});
	const legalBasis = doc.sections.find((s) => s.id === "legal-basis")!;
	const blob = JSON.stringify(legalBasis);
	expect(blob).toContain("Providing the service");
	expect(blob).toContain("Performance of a contract (Article 6(1)(b))");
	expect(blob).toContain("Marketing communications");
	expect(blob).toContain("Consent (Article 6(1)(a))");
});

test("consent-withdrawal section is rendered when any data category uses consent (EU)", () => {
	const doc = compile({
		type: "privacy",
		...minimalPrivacyConfig,
		jurisdictions: ["eu"],
		data: {
			collected: {
				"Personal Information": ["Name"],
				"Marketing Data": ["Mailing list signup"],
			},
			purposes: {
				"Personal Information": "Providing the service",
				"Marketing Data": "Marketing communications",
			},
			lawfulBasis: {
				"Personal Information": "contract",
				"Marketing Data": "consent",
			},
			retention: {
				"Personal Information": "Until account deletion",
				"Marketing Data": "Until consent is withdrawn",
			},
		},
	});
	const cw = doc.sections.find((s) => s.id === "consent-withdrawal")!;
	expect(cw).toBeDefined();
	const blob = JSON.stringify(cw);
	expect(blob).toContain("Right to Withdraw Consent");
	expect(blob).toContain("Article 7(3)");
	expect(blob).toContain(minimalPrivacyConfig.company.contact);
	expect(blob).toContain("does not affect the lawfulness");
});

test("consent-withdrawal section is rendered when only cookies use consent (EU)", () => {
	const doc = compile({
		type: "privacy",
		...minimalPrivacyConfig,
		jurisdictions: ["eu"],
		cookies: {
			used: { essential: true, analytics: true },
			lawfulBasis: { essential: "legal_obligation", analytics: "consent" },
		},
	});
	const cw = doc.sections.find((s) => s.id === "consent-withdrawal")!;
	expect(cw).toBeDefined();
	const blob = JSON.stringify(cw);
	expect(blob).toContain("Right to Withdraw Consent");
});

test("consent-withdrawal section is omitted when no data or cookie basis is consent (EU)", () => {
	const doc = compile({
		type: "privacy",
		...minimalPrivacyConfig,
		jurisdictions: ["eu"],
		data: {
			collected: {
				"Personal Information": ["Name"],
				"Service Data": ["Logs"],
			},
			purposes: {
				"Personal Information": "Providing the service",
				"Service Data": "Service communications",
			},
			lawfulBasis: {
				"Personal Information": "contract",
				"Service Data": "legitimate_interests",
			},
			retention: {
				"Personal Information": "Until account deletion",
				"Service Data": "30 days",
			},
		},
		cookies: {
			used: { essential: true },
			lawfulBasis: { essential: "legal_obligation" },
		},
	});
	expect(doc.sections.find((s) => s.id === "consent-withdrawal")).toBeUndefined();
});

test("consent-withdrawal section is omitted under non-EU/UK jurisdictions even when consent is used", () => {
	const doc = compile({
		type: "privacy",
		...minimalPrivacyConfig,
		jurisdictions: ["us-ca"],
		cookies: {
			used: { essential: true, analytics: true },
			lawfulBasis: { essential: "legal_obligation", analytics: "consent" },
		},
	});
	expect(doc.sections.find((s) => s.id === "consent-withdrawal")).toBeUndefined();
});

test("legal-basis section no longer carries the consent-withdrawal paragraph (it's its own section now)", () => {
	const doc = compile({
		type: "privacy",
		...minimalPrivacyConfig,
		jurisdictions: ["eu"],
		data: {
			collected: { "Marketing Data": ["Email"] },
			purposes: { "Marketing Data": "Marketing communications" },
			lawfulBasis: { "Marketing Data": "consent" },
			retention: { "Marketing Data": "Until consent is withdrawn" },
		},
	});
	const legalBasis = doc.sections.find((s) => s.id === "legal-basis")!;
	const blob = JSON.stringify(legalBasis);
	expect(blob).not.toContain("Right to withdraw consent");
});

test("legal-basis section is omitted entirely under non-GDPR jurisdictions", () => {
	const doc = compile({
		type: "privacy",
		...minimalPrivacyConfig,
		jurisdictions: ["ca"],
	});
	expect(doc.sections.find((s) => s.id === "legal-basis")).toBeUndefined();
});

test("automated-decision-making section is omitted under non-EU/UK jurisdictions even when set", () => {
	const doc = compile({
		type: "privacy",
		...minimalPrivacyConfig,
		jurisdictions: ["us-ca"],
		automatedDecisionMaking: [],
	});
	expect(doc.sections.find((s) => s.id === "automated-decision-making")).toBeUndefined();
});

test("automated-decision-making section is omitted when field is undefined under EU", () => {
	const doc = compile({
		type: "privacy",
		...minimalPrivacyConfig,
		jurisdictions: ["eu"],
	});
	expect(doc.sections.find((s) => s.id === "automated-decision-making")).toBeUndefined();
});

test("automated-decision-making section emits explicit-none paragraph when [] under EU", () => {
	const doc = compile({
		type: "privacy",
		...minimalPrivacyConfig,
		jurisdictions: ["eu"],
		automatedDecisionMaking: [],
	});
	const adm = doc.sections.find((s) => s.id === "automated-decision-making")!;
	expect(adm).toBeDefined();
	const blob = JSON.stringify(adm);
	expect(blob).toContain("We do not engage in automated decision-making");
	expect(blob).toContain("Article 22");
	expect(blob).not.toContain("Right to human review");
});

test("gdpr-supplement complaint paragraph links to EDPB members directory", () => {
	const doc = compile({
		type: "privacy",
		...minimalPrivacyConfig,
		jurisdictions: ["eu"],
	});
	const gdpr = doc.sections.find((s) => s.id === "gdpr-supplement")!;
	const blob = JSON.stringify(gdpr);
	expect(blob).toContain("edpb.europa.eu/about-edpb/about-edpb/members_en");
	expect(blob).toContain("supervisory authority");
	expect(blob).not.toContain("your local data protection authority");
});

test("gdpr-supplement does not mention Article 27 representative when unset", () => {
	const doc = compile({
		type: "privacy",
		...minimalPrivacyConfig,
		jurisdictions: ["eu"],
	});
	const gdpr = doc.sections.find((s) => s.id === "gdpr-supplement")!;
	const blob = JSON.stringify(gdpr);
	expect(blob).not.toContain("Article 27");
	expect(blob).not.toContain("representative in the European Union");
});

test("gdpr-supplement renders Article 27 representative paragraph when configured", () => {
	const doc = compile({
		type: "privacy",
		...minimalPrivacyConfig,
		jurisdictions: ["eu"],
		company: {
			...minimalPrivacyConfig.company,
			euRepresentative: {
				name: "Acme EU Ltd.",
				address: "1 Rue de la Loi, Brussels",
				email: "eu-rep@acme.com",
			},
		},
	});
	const gdpr = doc.sections.find((s) => s.id === "gdpr-supplement")!;
	const blob = JSON.stringify(gdpr);
	expect(blob).toContain("Article 27 GDPR");
	expect(blob).toContain("Acme EU Ltd.");
	expect(blob).toContain("1 Rue de la Loi, Brussels");
	expect(blob).toContain("eu-rep@acme.com");
});

test("gdpr-supplement names specific Article 46 transfer safeguards and links the adequacy registry", () => {
	const doc = compile({
		type: "privacy",
		...minimalPrivacyConfig,
		jurisdictions: ["eu"],
	});
	const gdpr = doc.sections.find((s) => s.id === "gdpr-supplement")!;
	const blob = JSON.stringify(gdpr);
	expect(blob).toContain("Chapter V");
	expect(blob).toContain("Standard Contractual Clauses");
	expect(blob).toContain("Binding Corporate Rules");
	expect(blob).toContain("adequate level of data protection");
	expect(blob).toContain(
		"commission.europa.eu/law/law-topic/data-protection/international-dimension-data-protection/adequacy-decisions_en",
	);
	expect(blob).toContain(minimalPrivacyConfig.company.contact);
	expect(blob).not.toContain("we ensure adequate safeguards are in place");
});

test("uk-gdpr-supplement still names the ICO with its complaint URL", () => {
	const doc = compile({
		type: "privacy",
		...minimalPrivacyConfig,
		jurisdictions: ["uk"],
	});
	const uk = doc.sections.find((s) => s.id === "uk-gdpr-supplement")!;
	const blob = JSON.stringify(uk);
	expect(blob).toContain("Information Commissioner");
	expect(blob).toContain("ico.org.uk/make-a-complaint");
});

test("automated-decision-making section enumerates each activity and appends Art. 22 right-to-human-review", () => {
	const doc = compile({
		type: "privacy",
		...minimalPrivacyConfig,
		jurisdictions: ["eu"],
		automatedDecisionMaking: [
			{
				name: "Fraud scoring",
				logic:
					"Transactions are scored by a rules engine combining device fingerprint and transaction history.",
				significance:
					"A high score may delay or decline a transaction; you can request human review.",
			},
		],
	});
	const adm = doc.sections.find((s) => s.id === "automated-decision-making")!;
	expect(adm).toBeDefined();
	const blob = JSON.stringify(adm);
	expect(blob).toContain("Fraud scoring");
	expect(blob).toContain("rules engine");
	expect(blob).toContain("Significance");
	expect(blob).toContain("Right to human review");
	expect(blob).toContain(minimalPrivacyConfig.company.contact);
});
