import { expect, test } from "vite-plus/test";
import type { PrivacyPolicyConfig } from "@openpolicy/core";
import { compile } from "@openpolicy/core";
import { isVNode } from "vue";
import { renderDocument } from ".";

const company = {
	name: "Acme",
	legalName: "Acme Inc.",
	address: "123 Main St",
	contact: "privacy@acme.com",
};

const privacyConfig: PrivacyPolicyConfig = {
	effectiveDate: "2026-01-01",
	company,
	data: {
		collected: { account: ["email", "name"] },
		purposes: { account: "To authenticate users" },
		lawfulBasis: { account: "contract" },
		retention: { account: "2 years" },
	},
	cookies: {
		used: { essential: true, analytics: false, marketing: false },
		lawfulBasis: { essential: "legal_obligation", analytics: "consent", marketing: "consent" },
	},
	thirdParties: [],
	userRights: ["access", "erasure"],
	jurisdictions: ["ca"],
};

test("renderDocument returns Vue VNodes", () => {
	const doc = compile({ type: "privacy", ...privacyConfig });
	const result = renderDocument(doc);
	expect(Array.isArray(result)).toBe(true);
	if (!Array.isArray(result)) throw new Error("Expected array result");
	expect(result.length).toBeGreaterThan(0);
	expect(isVNode(result[0])).toBe(true);
});

test("renderDocument works with OpenPolicyConfig via compile", () => {
	const doc = compile({ type: "privacy", ...privacyConfig });
	const result = renderDocument(doc);
	expect(result).toBeTruthy();
});
