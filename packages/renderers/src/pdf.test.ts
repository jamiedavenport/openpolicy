import { expect, test } from "vite-plus/test";
import { compile, type PolicyInput } from "@openpolicy/core";
import { renderPDF } from "./pdf";

const input: PolicyInput = {
	type: "privacy",
	effectiveDate: "2026-01-01",
	company: {
		name: "Acme Inc.",
		legalName: "Acme Corporation",
		address: "123 Main St",
		contact: "privacy@acme.com",
	},
	dataCollected: { "Account Information": ["Name", "Email"] },
	legalBasis: "legitimate_interests" as const,
	retention: { "Account data": "Until deletion" },
	cookies: { essential: true, analytics: false, marketing: false },
	thirdParties: [],
	userRights: ["access" as const],
	jurisdictions: ["ca" as const],
};

test("renderPDF returns a Buffer", async () => {
	const doc = compile(input);
	const result = await renderPDF(doc);
	expect(result).toBeInstanceOf(Buffer);
	expect(result.length).toBeGreaterThan(100);
});

test("renderPDF output begins with PDF magic bytes", async () => {
	const doc = compile(input);
	const result = await renderPDF(doc);
	expect(result.slice(0, 5).toString("ascii")).toBe("%PDF-");
});
