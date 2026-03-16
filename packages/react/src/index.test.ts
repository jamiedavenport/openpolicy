import { expect, test } from "bun:test";
import { useCookiePolicy, usePrivacyPolicy, useTermsOfService } from ".";

test("usePrivacyPolicy returns sections array", () => {
	const result = usePrivacyPolicy();
	expect(result).toHaveProperty("sections");
	expect(Array.isArray(result.sections)).toBe(true);
});

test("useTermsOfService returns sections array", () => {
	const result = useTermsOfService();
	expect(result).toHaveProperty("sections");
	expect(Array.isArray(result.sections)).toBe(true);
});

test("useCookiePolicy returns sections array", () => {
	const result = useCookiePolicy();
	expect(result).toHaveProperty("sections");
	expect(Array.isArray(result.sections)).toBe(true);
});
