import { expect, test } from "bun:test";
import { compilePrivacyPolicy } from "./privacy";
import type { PrivacyPolicyConfig } from "./types";
import { validatePrivacyPolicy } from "./validate";

const baseConfig: PrivacyPolicyConfig = {
	effectiveDate: "2026-01-01",
	company: {
		name: "Acme Inc.",
		legalName: "Acme Corporation",
		address: "123 Main St, Springfield, USA",
		contact: "privacy@acme.com",
	},
	dataCollected: {
		"Account Information": ["Name", "Email address"],
		"Usage Data": ["IP address", "Browser type"],
	},
	legalBasis: "Legitimate interests and consent",
	retention: {
		"Account data": "Until account deletion",
		"Usage logs": "90 days",
	},
	cookies: { essential: true, analytics: true, marketing: false },
	thirdParties: [{ name: "Stripe", purpose: "Payment processing" }],
	userRights: ["access", "erasure", "portability"],
	jurisdictions: ["us"],
};

test("default markdown output contains company name", () => {
	const results = compilePrivacyPolicy(baseConfig);
	expect(results[0]?.format).toBe("markdown");
	expect(results[0]?.content).toContain("Acme Inc.");
});

test("US-only config: no legal-basis or gdpr-supplement sections", () => {
	const results = compilePrivacyPolicy(baseConfig);
	const ids = results[0]?.sections.map((s) => s.id);
	expect(ids).not.toContain("legal-basis");
	expect(ids).not.toContain("gdpr-supplement");
	expect(ids).not.toContain("ccpa-supplement");
});

test("EU config: legal-basis + gdpr-supplement sections present", () => {
	const config: PrivacyPolicyConfig = { ...baseConfig, jurisdictions: ["eu"] };
	const results = compilePrivacyPolicy(config);
	const ids = results[0]?.sections.map((s) => s.id);
	expect(ids).toContain("legal-basis");
	expect(ids).toContain("gdpr-supplement");
});

test("CA config: ccpa-supplement section present", () => {
	const config: PrivacyPolicyConfig = { ...baseConfig, jurisdictions: ["ca"] };
	const results = compilePrivacyPolicy(config);
	const ids = results[0]?.sections.map((s) => s.id);
	expect(ids).toContain("ccpa-supplement");
	expect(ids).not.toContain("legal-basis");
	expect(ids).not.toContain("gdpr-supplement");
});

test("multi-jurisdiction (us + eu + ca): all jurisdiction sections present", () => {
	const config: PrivacyPolicyConfig = {
		...baseConfig,
		jurisdictions: ["us", "eu", "ca"],
	};
	const results = compilePrivacyPolicy(config);

	if (results.length === 0) {
		throw new Error("No results");
	}

	const ids = results[0]?.sections.map((s) => s.id);
	expect(ids).toContain("legal-basis");
	expect(ids).toContain("gdpr-supplement");
	expect(ids).toContain("ccpa-supplement");
});

test("requesting pdf format throws 'not yet implemented'", () => {
	expect(() => compilePrivacyPolicy(baseConfig, { formats: ["pdf"] })).toThrow(
		"not yet implemented",
	);
});

test("children policy absent when no children config", () => {
	const results = compilePrivacyPolicy(baseConfig);
	const ids = results[0]?.sections.map((s) => s.id);
	expect(ids).not.toContain("children-privacy");
});

test("children policy present and mentions age when provided", () => {
	const config = {
		...baseConfig,
		children: { underAge: 13, noticeUrl: "https://example.com/coppanotice" },
	};
	const results = compilePrivacyPolicy(config as any);
	const ids = results[0]?.sections.map((s) => s.id);
	expect(ids).toContain("children-privacy");
	expect(results[0]?.content).toContain("13 years old");
	expect(results[0]?.content).toContain("coppanotice");
});

test("validation reports error for non-positive underAge", () => {
	const config = { ...baseConfig, children: { underAge: 0 } };
	const issues = validatePrivacyPolicy(config as any);
	expect(
		issues.some(
			(i: { level: string; message: string }) =>
				i.level === "error" && i.message.includes("underAge"),
		),
	).toBe(true);
});
