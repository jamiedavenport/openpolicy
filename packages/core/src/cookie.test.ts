import { expect, test } from "bun:test";
import { compileCookiePolicy } from "./cookie";
import type { CookiePolicyConfig } from "./types";

const baseConfig: CookiePolicyConfig = {
	effectiveDate: "2026-01-01",
	company: {
		name: "Acme",
		legalName: "Acme Inc.",
		address: "123 Main St, Springfield",
		contact: "privacy@acme.com",
	},
	cookies: {
		essential: true,
		analytics: true,
		functional: false,
		marketing: false,
	},
	jurisdictions: ["eu", "us"],
};

test("compiles to markdown by default", () => {
	const results = compileCookiePolicy(baseConfig);
	expect(results).toHaveLength(1);
	expect(results[0]?.format).toBe("markdown");
	expect(results[0]?.content).toContain("Cookie Policy");
	expect(results[0]?.content).toContain("Acme");
});

test("compiles to html", () => {
	const results = compileCookiePolicy(baseConfig, { formats: ["html"] });
	expect(results).toHaveLength(1);
	expect(results[0]?.format).toBe("html");
	expect(results[0]?.content).toContain("<h2>");
	expect(results[0]?.content).toContain("Acme");
});

test("includes introduction section", () => {
	const results = compileCookiePolicy(baseConfig);
	expect(results[0]?.content).toContain("Introduction");
	expect(results[0]?.content).toContain("2026-01-01");
	expect(results[0]?.content).toContain("privacy@acme.com");
});

test("includes what are cookies section", () => {
	const results = compileCookiePolicy(baseConfig);
	expect(results[0]?.content).toContain("What Are Cookies");
	expect(results[0]?.content).toContain("small text files");
});

test("includes cookie types section with enabled types only", () => {
	const results = compileCookiePolicy(baseConfig);
	expect(results[0]?.content).toContain("Types of Cookies We Use");
	expect(results[0]?.content).toContain("Essential Cookies");
	expect(results[0]?.content).toContain("Analytics Cookies");
	expect(results[0]?.content).not.toContain("Functional Cookies");
	expect(results[0]?.content).not.toContain("Marketing Cookies");
});

test("includes all four cookie types when all enabled", () => {
	const config: CookiePolicyConfig = {
		...baseConfig,
		cookies: {
			essential: true,
			analytics: true,
			functional: true,
			marketing: true,
		},
	};
	const results = compileCookiePolicy(config);
	expect(results[0]?.content).toContain("Essential Cookies");
	expect(results[0]?.content).toContain("Analytics Cookies");
	expect(results[0]?.content).toContain("Functional Cookies");
	expect(results[0]?.content).toContain("Marketing Cookies");
});

test("omits tracking technologies section when not provided", () => {
	const results = compileCookiePolicy(baseConfig);
	expect(results[0]?.content).not.toContain("Similar Tracking Technologies");
});

test("includes tracking technologies section when provided", () => {
	const config: CookiePolicyConfig = {
		...baseConfig,
		trackingTechnologies: ["web beacons", "pixels", "local storage"],
	};
	const results = compileCookiePolicy(config);
	expect(results[0]?.content).toContain("Similar Tracking Technologies");
	expect(results[0]?.content).toContain("web beacons");
	expect(results[0]?.content).toContain("pixels");
	expect(results[0]?.content).toContain("local storage");
});

test("omits consent section when consentMechanism not provided", () => {
	const results = compileCookiePolicy(baseConfig);
	expect(results[0]?.content).not.toContain("User Consent");
});

test("includes consent section when consentMechanism provided", () => {
	const config: CookiePolicyConfig = {
		...baseConfig,
		consentMechanism: {
			hasBanner: true,
			hasPreferencePanel: true,
			canWithdraw: true,
		},
	};
	const results = compileCookiePolicy(config);
	expect(results[0]?.content).toContain("User Consent");
	expect(results[0]?.content).toContain("cookie consent banner");
	expect(results[0]?.content).toContain("preference panel");
	expect(results[0]?.content).toContain("withdraw");
});

test("includes managing cookies section always", () => {
	const results = compileCookiePolicy(baseConfig);
	expect(results[0]?.content).toContain("Managing Your Cookie Preferences");
	expect(results[0]?.content).toContain("Chrome");
	expect(results[0]?.content).toContain("Firefox");
});

test("omits third-party section when thirdParties not provided", () => {
	const results = compileCookiePolicy(baseConfig);
	expect(results[0]?.content).not.toContain("Third-Party Cookies");
});

test("omits third-party section when thirdParties is empty", () => {
	const config: CookiePolicyConfig = { ...baseConfig, thirdParties: [] };
	const results = compileCookiePolicy(config);
	expect(results[0]?.content).not.toContain("Third-Party Cookies");
});

test("includes third-party section with entries", () => {
	const config: CookiePolicyConfig = {
		...baseConfig,
		thirdParties: [
			{
				name: "Google Analytics",
				purpose: "Website analytics",
				policyUrl: "https://policies.google.com/privacy",
			},
			{ name: "Stripe", purpose: "Payment processing" },
		],
	};
	const results = compileCookiePolicy(config);
	expect(results[0]?.content).toContain("Third-Party Cookies");
	expect(results[0]?.content).toContain("Google Analytics");
	expect(results[0]?.content).toContain("Website analytics");
	expect(results[0]?.content).toContain("policies.google.com");
	expect(results[0]?.content).toContain("Stripe");
});

test("includes jurisdiction section for eu and us", () => {
	const results = compileCookiePolicy(baseConfig);
	expect(results[0]?.content).toContain("Legal Requirements");
	expect(results[0]?.content).toContain("European Union");
	expect(results[0]?.content).toContain("United States");
});

test("omits jurisdiction section when jurisdictions empty", () => {
	const config: CookiePolicyConfig = { ...baseConfig, jurisdictions: [] };
	const results = compileCookiePolicy(config);
	expect(results[0]?.content).not.toContain("Legal Requirements");
});

test("includes updates section always", () => {
	const results = compileCookiePolicy(baseConfig);
	expect(results[0]?.content).toContain("Updates to This Policy");
});

test("includes contact section with company details", () => {
	const results = compileCookiePolicy(baseConfig);
	expect(results[0]?.content).toContain("Contact Us");
	expect(results[0]?.content).toContain("Acme Inc.");
	expect(results[0]?.content).toContain("123 Main St");
	expect(results[0]?.content).toContain("privacy@acme.com");
});

test("returns correct sections array", () => {
	const results = compileCookiePolicy(baseConfig);
	const sectionIds = results[0]?.sections.map((s) => s.id);
	expect(sectionIds).toContain("introduction");
	expect(sectionIds).toContain("what-are-cookies");
	expect(sectionIds).toContain("cookie-types");
	expect(sectionIds).toContain("cookie-usage");
	expect(sectionIds).toContain("cookie-duration");
	expect(sectionIds).toContain("managing-cookies");
	expect(sectionIds).toContain("jurisdiction");
	expect(sectionIds).toContain("updates");
	expect(sectionIds).toContain("contact");
	// Optional sections omitted
	expect(sectionIds).not.toContain("tracking-technologies");
	expect(sectionIds).not.toContain("consent");
	expect(sectionIds).not.toContain("third-party-cookies");
});

test("throws for pdf format", () => {
	expect(() => compileCookiePolicy(baseConfig, { formats: ["pdf"] })).toThrow(
		"not yet implemented",
	);
});

test("throws for jsx format", () => {
	expect(() => compileCookiePolicy(baseConfig, { formats: ["jsx"] })).toThrow(
		"not yet implemented",
	);
});

test("multiple formats", () => {
	const results = compileCookiePolicy(baseConfig, {
		formats: ["markdown", "html"],
	});
	expect(results).toHaveLength(2);
	expect(results[0]?.format).toBe("markdown");
	expect(results[1]?.format).toBe("html");
});
