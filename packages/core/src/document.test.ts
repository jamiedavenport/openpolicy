import { expect, test } from "bun:test";
import type { ParagraphNode } from "./documents";
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
	dataCollected: { "Account Information": ["Name", "Email address"] },
	legalBasis: "Legitimate interests and consent",
	retention: { "Account data": "Until account deletion" },
	cookies: { essential: true, analytics: false, marketing: false },
	thirdParties: [],
	userRights: ["access"],
	jurisdictions: ["us"],
};

test("compile returns a Document with correct type", () => {
	const doc = compile({ type: "privacy", ...minimalPrivacyConfig });
	expect(doc.policyType).toBe("privacy");
	expect(Array.isArray(doc.sections)).toBe(true);
});

test("compile returns correct type for terms", () => {
	const doc = compile({
		type: "terms",
		effectiveDate: "2026-01-01",
		company: {
			name: "Acme Inc.",
			legalName: "Acme Corporation",
			address: "123 Main St, Springfield, USA",
			contact: "legal@acme.com",
		},
		acceptance: { methods: ["using the service"] },
		governingLaw: { jurisdiction: "California, USA" },
	});
	expect(doc.policyType).toBe("terms");
	expect(Array.isArray(doc.sections)).toBe(true);
});

test("privacy compile returns non-empty sections", () => {
	const doc = compile({ type: "privacy", ...minimalPrivacyConfig });
	expect(doc.sections.length).toBeGreaterThan(0);
});

test("US-only config has expected section IDs (no EU/CA-only sections)", () => {
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
});

test("CA config includes ccpa-supplement", () => {
	const doc = compile({
		type: "privacy",
		...minimalPrivacyConfig,
		jurisdictions: ["ca"],
	});
	const ids = doc.sections.map((s) => s.id);
	expect(ids).toContain("ccpa-supplement");
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
	expect(section.content.length).toBe(2);
	const secondPara = section.content[1];
	expect(secondPara?.type).toBe("paragraph");
	const children = (secondPara as ParagraphNode).children;
	const linkNode = children.find((c) => c.type === "link");
	expect(linkNode).toBeDefined();
});

test("introduction section has ParagraphNode children", () => {
	const doc = compile({ type: "privacy", ...minimalPrivacyConfig });
	const intro = doc.sections.find((s) => s.id === "introduction")!;
	expect(intro.content.length).toBeGreaterThan(0);
	const firstNode = intro.content[0];
	expect(firstNode?.type).toBe("paragraph");
	const firstPara = firstNode as ParagraphNode;
	expect(firstPara.children.length).toBeGreaterThan(0);
	expect(firstPara.children[0]?.type).toBe("text");
});
