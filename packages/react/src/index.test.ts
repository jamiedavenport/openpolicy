import { expect, test } from "bun:test";
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
	dataCollected: { account: ["email", "name"] },
	legalBasis: "Consent",
	retention: { account: "2 years" },
	cookies: { essential: true, analytics: false, marketing: false },
	thirdParties: [],
	userRights: ["access", "deletion"],
	jurisdictions: ["us"],
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
