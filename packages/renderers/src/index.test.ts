import { expect, test } from "vite-plus/test";
import type { PolicyInput } from "@openpolicy/core";
import { compilePolicy } from "./index";

const input: PolicyInput = {
	type: "privacy",
	effectiveDate: "2026-01-01",
	company: {
		name: "Acme Inc.",
		legalName: "Acme Corporation",
		address: "123 Main St, Springfield, USA",
		contact: "privacy@acme.com",
	},
	data: {
		collected: { "Account Information": ["Name", "Email"] },
		purposes: { "Account Information": "To authenticate users" },
	},
	legalBasis: { "Providing the service": "legitimate_interests" },
	retention: { "Account data": "Until deletion" },
	cookies: { essential: true, analytics: false, marketing: false },
	thirdParties: [],
	userRights: ["access"],
	jurisdictions: ["ca"],
};

test("compilePolicy routes privacy input to markdown", async () => {
	const results = await compilePolicy(input);
	expect(Array.isArray(results)).toBe(true);
	expect(results[0]?.format).toBe("markdown");
	expect(results[0]?.content).toContain("Acme Inc.");
});
