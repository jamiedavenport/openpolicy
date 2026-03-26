import { expect, test } from "bun:test";
import type { CookiePolicyConfig } from "@openpolicy/core";
import { h, isVNode } from "vue";
import { CookiePreferencePanel } from "./CookiePreferencePanel";

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
		functional: true,
		marketing: false,
	},
	jurisdictions: ["us"],
};

test("CookiePreferencePanel creates a valid VNode", () => {
	const vnode = h(CookiePreferencePanel, { config: cookieConfig });
	expect(isVNode(vnode)).toBe(true);
});

test("CookiePreferencePanel creates a valid VNode with scoped slot", () => {
	const vnode = h(
		CookiePreferencePanel,
		{ config: cookieConfig },
		{
			default: () => h("div", "custom"),
		},
	);
	expect(isVNode(vnode)).toBe(true);
});

test("CookiePreferencePanel is a Vue component with correct name", () => {
	expect(CookiePreferencePanel.name).toBe("CookiePreferencePanel");
});
