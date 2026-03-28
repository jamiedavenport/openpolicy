import { afterEach, expect, test } from "bun:test";
import type { CookiePolicyConfig } from "@openpolicy/core";
import { clearConsent } from "@openpolicy/core";
import { act, createElement, isValidElement, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
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

// ─── Behavioral tests ─────────────────────────────────────────────────────────

afterEach(() => {
	clearConsent();
	document.body.innerHTML = "";
});

async function mountBanner(children?: ReactNode) {
	const container = document.createElement("div");
	document.body.appendChild(container);
	const root = createRoot(container);
	await act(async () => {
		root.render(
			createElement(CookieBanner.Root, { config: cookieConfig }, children),
		);
	});
	return {
		container,
		cleanup: () => act(async () => root.unmount()),
	};
}

test("CookieBanner.Root has data-state=open when status is undecided", async () => {
	const { container, cleanup } = await mountBanner();
	const el = container.querySelector("[data-op-cookie-banner-root]");
	expect(el?.getAttribute("data-state")).toBe("open");
	await cleanup();
});

test("AcceptButton click sets data-state to closed", async () => {
	const { container, cleanup } = await mountBanner(
		createElement(CookieBanner.AcceptButton, null),
	);
	const btn = container.querySelector(
		"[data-op-cookie-banner-accept]",
	) as HTMLButtonElement;
	await act(async () => btn.click());
	const el = container.querySelector("[data-op-cookie-banner-root]");
	expect(el?.getAttribute("data-state")).toBe("closed");
	await cleanup();
});

test("RejectButton click sets data-state to closed", async () => {
	const { container, cleanup } = await mountBanner(
		createElement(CookieBanner.RejectButton, null),
	);
	const btn = container.querySelector(
		"[data-op-cookie-banner-reject]",
	) as HTMLButtonElement;
	await act(async () => btn.click());
	const el = container.querySelector("[data-op-cookie-banner-root]");
	expect(el?.getAttribute("data-state")).toBe("closed");
	await cleanup();
});

test("CustomizeButton fires onClick prop", async () => {
	let called = false;
	const { container, cleanup } = await mountBanner(
		createElement(CookieBanner.CustomizeButton, {
			onClick: () => {
				called = true;
			},
		}),
	);
	const btn = container.querySelector(
		"[data-op-cookie-banner-customize]",
	) as HTMLButtonElement;
	await act(async () => btn.click());
	expect(called).toBe(true);
	await cleanup();
});

test("AcceptButton with asChild renders child element not a button", async () => {
	const { container, cleanup } = await mountBanner(
		createElement(
			CookieBanner.AcceptButton,
			{ asChild: true },
			createElement("span", { "data-test-child": "" }, "Accept"),
		),
	);
	expect(
		container.querySelector("button[data-op-cookie-banner-accept]"),
	).toBeNull();
	expect(container.querySelector("span[data-test-child]")).not.toBeNull();
	await cleanup();
});
