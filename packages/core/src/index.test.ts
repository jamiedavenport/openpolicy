import { expect, test } from "vite-plus/test";
import { expandOpenPolicyConfig, isOpenPolicyConfig, shouldEmit } from "./index";
import type { OpenPolicyConfig, PolicyInput } from "./types";

const input: PolicyInput = {
	type: "privacy",
	effectiveDate: "2026-01-01",
	company: {
		name: "Acme Inc.",
		legalName: "Acme Corporation",
		address: "123 Main St, Springfield, USA",
		contact: { email: "privacy@acme.com" },
	},
	data: {
		collected: { "Account Information": ["Name", "Email"] },
		context: {
			"Account Information": {
				purpose: "To authenticate users",
				lawfulBasis: "contract",
				retention: "Until deletion",
				provision: {
					basis: "contract-prerequisite",
					consequences: "We cannot create or operate your account.",
				},
			},
		},
	},
	cookies: {
		used: { essential: true, analytics: false, marketing: false },
		context: {
			essential: { lawfulBasis: "legal_obligation" },
			analytics: { lawfulBasis: "consent" },
			marketing: { lawfulBasis: "consent" },
		},
	},
	thirdParties: [],
	userRights: ["access"],
	jurisdictions: ["ca"],
};

const company = {
	name: "Acme Inc.",
	legalName: "Acme Corporation",
	address: "123 Main St, Springfield, USA",
	contact: { email: "privacy@acme.com" },
};

const fullConfig: OpenPolicyConfig = {
	company,
	effectiveDate: "2026-01-01",
	jurisdictions: ["ca"],
	data: {
		collected: { "Account Information": ["Name", "Email"] },
		context: {
			"Account Information": {
				purpose: "To authenticate users",
				lawfulBasis: "contract",
				retention: "Until deletion",
				provision: {
					basis: "contract-prerequisite",
					consequences: "We cannot create or operate your account.",
				},
			},
		},
	},
	cookies: {
		used: { essential: true, analytics: false, marketing: false },
		context: {
			essential: { lawfulBasis: "legal_obligation" },
			analytics: { lawfulBasis: "consent" },
			marketing: { lawfulBasis: "consent" },
		},
	},
	thirdParties: [],
};

test("isOpenPolicyConfig returns true for flat config", () => {
	expect(isOpenPolicyConfig(fullConfig)).toBe(true);
});

test("isOpenPolicyConfig returns false for PolicyInput (has type discriminator)", () => {
	expect(isOpenPolicyConfig(input)).toBe(false);
});

test("isOpenPolicyConfig returns false for null/non-object", () => {
	expect(isOpenPolicyConfig(null)).toBe(false);
	expect(isOpenPolicyConfig("string")).toBe(false);
	expect(isOpenPolicyConfig(42)).toBe(false);
});

test("isOpenPolicyConfig returns false for object without effectiveDate", () => {
	expect(isOpenPolicyConfig({ company })).toBe(false);
});

test("expandOpenPolicyConfig emits both inputs when all fields present", () => {
	const inputs = expandOpenPolicyConfig(fullConfig);
	expect(inputs).toHaveLength(2);
	expect(inputs[0]?.type).toBe("privacy");
	expect(inputs[1]?.type).toBe("cookie");
});

test("expandOpenPolicyConfig merges company and shared fields into each input", () => {
	const inputs = expandOpenPolicyConfig(fullConfig);
	expect(inputs[0]?.company).toEqual(company);
	expect(inputs[1]?.company).toEqual(company);
	expect(inputs[0]?.effectiveDate).toBe("2026-01-01");
	expect(inputs[1]?.effectiveDate).toBe("2026-01-01");
	expect(inputs[0]?.jurisdictions).toEqual(["ca"]);
	expect(inputs[1]?.jurisdictions).toEqual(["ca"]);
});

test("expandOpenPolicyConfig auto-detects privacy-only when cookies omitted", () => {
	const { cookies: _, ...privacyOnly } = fullConfig;
	const inputs = expandOpenPolicyConfig(privacyOnly);
	expect(inputs).toHaveLength(1);
	expect(inputs[0]?.type).toBe("privacy");
});

test("expandOpenPolicyConfig auto-detects cookie-only when no privacy fields", () => {
	const inputs = expandOpenPolicyConfig({
		company,
		effectiveDate: "2026-01-01",
		jurisdictions: ["ca"],
		cookies: {
			used: { essential: true },
			context: { essential: { lawfulBasis: "legal_obligation" } },
		},
	});
	expect(inputs).toHaveLength(1);
	expect(inputs[0]?.type).toBe("cookie");
});

test("expandOpenPolicyConfig returns empty array when nothing to emit", () => {
	const inputs = expandOpenPolicyConfig({
		company,
		effectiveDate: "2026-01-01",
		jurisdictions: ["ca"],
	});
	expect(inputs).toHaveLength(0);
});

test("expandOpenPolicyConfig passes automatedDecisionMaking through unchanged when set", () => {
	const inputs = expandOpenPolicyConfig({
		...fullConfig,
		automatedDecisionMaking: [
			{ name: "Fraud scoring", logic: "Rules engine", significance: "May decline" },
		],
	});
	const privacy = inputs.find((i) => i.type === "privacy");
	expect(privacy?.type).toBe("privacy");
	if (privacy?.type !== "privacy") throw new Error("expected privacy input");
	expect(privacy.automatedDecisionMaking).toEqual([
		{ name: "Fraud scoring", logic: "Rules engine", significance: "May decline" },
	]);
});

test("expandOpenPolicyConfig preserves undefined automatedDecisionMaking (no default)", () => {
	const inputs = expandOpenPolicyConfig(fullConfig);
	const privacy = inputs.find((i) => i.type === "privacy");
	if (privacy?.type !== "privacy") throw new Error("expected privacy input");
	expect(privacy.automatedDecisionMaking).toBeUndefined();
});

test("expandOpenPolicyConfig preserves explicit empty automatedDecisionMaking array", () => {
	const inputs = expandOpenPolicyConfig({ ...fullConfig, automatedDecisionMaking: [] });
	const privacy = inputs.find((i) => i.type === "privacy");
	if (privacy?.type !== "privacy") throw new Error("expected privacy input");
	expect(privacy.automatedDecisionMaking).toEqual([]);
});

test("shouldEmit honours explicit policies override", () => {
	const config: OpenPolicyConfig = {
		...fullConfig,
		policies: ["privacy"],
	};
	expect(shouldEmit("privacy", config)).toBe(true);
	expect(shouldEmit("cookie", config)).toBe(false);
	const inputs = expandOpenPolicyConfig(config);
	expect(inputs).toHaveLength(1);
	expect(inputs[0]?.type).toBe("privacy");
});
