import { expect, test } from "vite-plus/test";
import type { PolicyStackConfig } from "@policystack/core";
import { compilePolicy } from "./index";
import type { OutputFormat } from "./index";

const config: PolicyStackConfig = {
	effectiveDate: "2026-01-01",
	locale: "en",
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
	jurisdictions: ["ca"],
};

test("compilePolicy routes a privacy config to markdown", async () => {
	const results = await compilePolicy(config, "privacy");
	expect(Array.isArray(results)).toBe(true);
	expect(results[0]?.format).toBe("markdown");
	expect(results[0]?.content).toContain("Acme Inc.");
	expect(results[0]?.filename).toBe("privacy-policy.md");
});

test("compilePolicy routes a cookie config to markdown", async () => {
	const results = await compilePolicy(config, "cookie");
	expect(results[0]?.filename).toBe("cookie-policy.md");
});

test("compilePolicy throws when the requested policy is not emitted", async () => {
	await expect(compilePolicy({ ...config, policies: ["cookie"] }, "privacy")).rejects.toThrow(
		/does not emit a privacy policy/,
	);
});

// PS-15 (§2.3): the `jsx` member was dropped from `OutputFormat` — the
// per-framework packages *are* the JSX story, and the `jsx` throw-path was
// deleted in Phase 0 (PS-2). The type now lives here (core compiles to an
// AST and never formats output); this test freezes the surface so it cannot
// silently regress.
test("OutputFormat is exactly markdown | html | pdf — no jsx (PS-15 / PS-2)", () => {
	// Exhaustive map over the union: adding or removing a member makes this
	// object literal a type error.
	const all: Record<OutputFormat, true> = { markdown: true, html: true, pdf: true };
	expect(Object.keys(all).sort()).toEqual(["html", "markdown", "pdf"]);

	// Re-introducing `jsx` to the union would turn this into an unused
	// `@ts-expect-error`, failing the type-check.
	// @ts-expect-error — "jsx" is not a member of OutputFormat
	const notAFormat: OutputFormat = "jsx";
	void notAFormat;
});
