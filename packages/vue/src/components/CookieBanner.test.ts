import { expect, test } from "bun:test";
import type { CookiePolicyConfig } from "@openpolicy/core";
import { h, isVNode } from "vue";
import { CookieBanner } from "./CookieBanner";

const cookieConfig: CookiePolicyConfig = {
	effectiveDate: "2026-01-01",
	company: {
		name: "Acme",
		legalName: "Acme Inc.",
		address: "123 Main St",
		contact: "privacy@acme.com",
	},
	cookies: {
		essential: true,
		analytics: true,
		functional: false,
		marketing: false,
	},
	jurisdictions: ["us"],
};

test("CookieBanner creates a valid VNode", () => {
	const vnode = h(CookieBanner, { config: cookieConfig });
	expect(isVNode(vnode)).toBe(true);
});

test("CookieBanner creates a valid VNode with scoped slot", () => {
	const vnode = h(
		CookieBanner,
		{ config: cookieConfig },
		{
			default: () => h("div", "custom"),
		},
	);
	expect(isVNode(vnode)).toBe(true);
});

test("CookieBanner is a Vue component with correct name", () => {
	expect(CookieBanner.name).toBe("CookieBanner");
});
