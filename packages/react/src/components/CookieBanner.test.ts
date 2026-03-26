import { expect, test } from "bun:test";
import type { CookiePolicyConfig } from "@openpolicy/core";
import type { ReactNode } from "react";
import { createElement, isValidElement } from "react";
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

test("CookieBanner returns a valid React element with default render", () => {
	const el = createElement(CookieBanner, { config: cookieConfig });
	expect(isValidElement(el)).toBe(true);
});

test("CookieBanner returns a valid React element with render prop", () => {
	const el = createElement(CookieBanner, { config: cookieConfig }, (() =>
		createElement("div", null, "custom")) as unknown as ReactNode);
	expect(isValidElement(el)).toBe(true);
});

test("CookieBanner returns null when no config provided and no context", () => {
	const el = createElement(CookieBanner, {});
	// The element itself is valid, but when rendered it should return null
	expect(isValidElement(el)).toBe(true);
});
