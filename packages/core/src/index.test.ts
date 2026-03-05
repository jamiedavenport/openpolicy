import { expect, test } from "bun:test";
import { compilePolicy } from "./index";
import type { PolicyInput } from "./types";

const input: PolicyInput = {
	type: "privacy",
	effectiveDate: "2026-01-01",
	company: {
		name: "Acme Inc.",
		legalName: "Acme Corporation",
		address: "123 Main St, Springfield, USA",
		contact: "privacy@acme.com",
	},
	dataCollected: { "Account Information": ["Name", "Email"] },
	legalBasis: "Legitimate interests",
	retention: { "Account data": "Until deletion" },
	cookies: { essential: true, analytics: false, marketing: false },
	thirdParties: [],
	userRights: ["access"],
	jurisdictions: ["us"],
};

test("compilePolicy routes privacy input to markdown", () => {
	const results = compilePolicy(input);
	expect(results).toBeArray();
	expect(results[0]?.format).toBe("markdown");
	expect(results[0]?.content).toContain("Acme Inc.");
});
