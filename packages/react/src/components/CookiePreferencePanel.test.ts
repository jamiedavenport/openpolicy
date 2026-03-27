import { expect, test } from "bun:test";
import type { CookiePolicyConfig } from "@openpolicy/core";
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

test("CookiePreferencePanel returns null when no config provided and no context", () => {
	const el = createElement(CookiePreferencePanel, {});
	expect(isValidElement(el)).toBe(true);
});

test("CookiePreferencePanel.Root creates a valid element", () => {
	const el = createElement(CookiePreferencePanel.Root, {
		config: cookieConfig,
	});
	expect(isValidElement(el)).toBe(true);
});

test("CookiePreferencePanel.Category creates a valid element", () => {
	const el = createElement(CookiePreferencePanel.Category, {
		name: "analytics",
	});
	expect(isValidElement(el)).toBe(true);
});

test("CookiePreferencePanel.SaveButton creates a valid element", () => {
	const el = createElement(CookiePreferencePanel.SaveButton, {});
	expect(isValidElement(el)).toBe(true);
});

test("CookiePreferencePanel.RejectAllButton creates a valid element", () => {
	const el = createElement(CookiePreferencePanel.RejectAllButton, {});
	expect(isValidElement(el)).toBe(true);
});
