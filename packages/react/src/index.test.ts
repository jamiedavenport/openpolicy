import { expect, test } from "vite-plus/test";
import type { PrivacyPolicyConfig } from "@openpolicy/core";
import { compile } from "@openpolicy/core";
import { isValidElement } from "react";
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
		context: {
			account: {
				purpose: "To authenticate users",
				lawfulBasis: "contract",
				retention: "2 years",
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
	userRights: ["access", "erasure"],
	jurisdictions: ["ca"],
};

test("renderDocument returns a React element", () => {
	const doc = compile({ type: "privacy", ...privacyConfig });
	const result = renderDocument(doc);
	expect(isValidElement(result)).toBe(true);
});

test("renderDocument works with OpenPolicyConfig via compile", () => {
	const doc = compile({ type: "privacy", ...privacyConfig });
	const result = renderDocument(doc);
	expect(result).toBeTruthy();
});
