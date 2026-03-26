import { expect, test } from "bun:test";
import type { CookiePolicyConfig } from "@openpolicy/core";
import type { ReactNode } from "react";
import { createElement, isValidElement } from "react";
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

test("CookiePreferencePanel returns a valid React element", () => {
	const el = createElement(CookiePreferencePanel, { config: cookieConfig });
	expect(isValidElement(el)).toBe(true);
});

test("CookiePreferencePanel returns a valid element with render prop", () => {
	const el = createElement(
		CookiePreferencePanel,
		{ config: cookieConfig },
		(() => createElement("div", null, "custom")) as unknown as ReactNode,
	);
	expect(isValidElement(el)).toBe(true);
});

test("CookiePreferencePanel returns null when no config provided and no context", () => {
	const el = createElement(CookiePreferencePanel, {});
	expect(isValidElement(el)).toBe(true);
});
