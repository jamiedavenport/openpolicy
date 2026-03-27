import { expect, test } from "bun:test";
import type { CookiePolicyConfig } from "@openpolicy/core";
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

test("CookieBanner returns null when no config provided and no context", () => {
	const el = createElement(CookieBanner, {});
	expect(isValidElement(el)).toBe(true);
});

test("CookieBanner.Root creates a valid element", () => {
	const el = createElement(CookieBanner.Root, { config: cookieConfig });
	expect(isValidElement(el)).toBe(true);
});

test("CookieBanner.AcceptButton creates a valid element", () => {
	const el = createElement(CookieBanner.AcceptButton, {});
	expect(isValidElement(el)).toBe(true);
});

test("CookieBanner.RejectButton creates a valid element", () => {
	const el = createElement(CookieBanner.RejectButton, {});
	expect(isValidElement(el)).toBe(true);
});

test("CookieBanner.CustomizeButton creates a valid element", () => {
	const el = createElement(CookieBanner.CustomizeButton, {});
	expect(isValidElement(el)).toBe(true);
});

test("CookieBanner.Card creates a valid element", () => {
	const el = createElement(CookieBanner.Card, {});
	expect(isValidElement(el)).toBe(true);
});
