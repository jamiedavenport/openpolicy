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
	},
	legalBasis: ["legitimate_interests", "consent"],
	retention: { "Account data": "Until account deletion" },
	cookies: { essential: true, analytics: false, marketing: false },
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
			data: { collected: {}, purposes: {} },
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
