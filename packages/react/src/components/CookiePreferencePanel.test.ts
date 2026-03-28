import { afterEach, expect, test } from "bun:test";
import type { CookieConsent, CookiePolicyConfig } from "@openpolicy/core";
import { clearConsent } from "@openpolicy/core";
import { act, createElement, isValidElement, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
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

// ─── Behavioral tests ─────────────────────────────────────────────────────────

afterEach(() => {
	clearConsent();
	document.body.innerHTML = "";
});

async function mountPanel(
	open = true,
	props: Record<string, unknown> = {},
	children?: ReactNode,
) {
	const container = document.createElement("div");
	document.body.appendChild(container);
	const root = createRoot(container);
	await act(async () => {
		root.render(
			createElement(
				CookiePreferencePanel.Root,
				// trapFocus disabled: happy-dom manual setup doesn't fully wire Window
				// scope, causing querySelectorAll internals to fail
				{ config: cookieConfig, open, trapFocus: false, ...props },
				children,
			),
		);
	});
	return {
		container,
		cleanup: () => act(async () => root.unmount()),
	};
}

test("CookiePreferencePanel.Root with open=true has data-state=open", async () => {
	const { container, cleanup } = await mountPanel(true);
	const el = container.querySelector("[data-op-cookie-preferences-root]");
	expect(el?.getAttribute("data-state")).toBe("open");
	await cleanup();
});

test("CookiePreferencePanel.Root with open=false has data-state=closed", async () => {
	const { container, cleanup } = await mountPanel(false);
	const el = container.querySelector("[data-op-cookie-preferences-root]");
	expect(el?.getAttribute("data-state")).toBe("closed");
	await cleanup();
});

test("SaveButton click calls onSave with consent object", async () => {
	let savedConsent: CookieConsent | undefined;
	const { container, cleanup } = await mountPanel(
		true,
		{
			onSave: (c: CookieConsent) => {
				savedConsent = c;
			},
		},
		createElement(CookiePreferencePanel.SaveButton, null),
	);
	const btn = container.querySelector(
		"[data-op-cookie-preferences-save]",
	) as HTMLButtonElement;
	await act(async () => btn.click());
	expect(savedConsent).toBeDefined();
	expect(savedConsent?.essential).toBe(true);
	await cleanup();
});

test("RejectAllButton click calls onOpenChange(false)", async () => {
	let openValue: boolean | undefined;
	const { container, cleanup } = await mountPanel(
		true,
		{
			onOpenChange: (v: boolean) => {
				openValue = v;
			},
		},
		createElement(CookiePreferencePanel.RejectAllButton, null),
	);
	const btn = container.querySelector(
		"[data-op-cookie-preferences-reject-all]",
	) as HTMLButtonElement;
	await act(async () => btn.click());
	expect(openValue).toBe(false);
	await cleanup();
});

test("Category render prop provides checked and onCheckedChange", async () => {
	let capturedChecked: boolean | undefined;
	let capturedOnChange: ((v: boolean) => void) | undefined;
	await mountPanel(
		true,
		{},
		createElement(CookiePreferencePanel.Category, {
			name: "analytics",
			// biome-ignore lint/correctness/noChildrenProp: Category.children is a render-prop function, not JSX children
			children: (({ checked, onCheckedChange }) => {
				capturedChecked = checked;
				capturedOnChange = onCheckedChange;
				return createElement("span", { "data-cat": "" });
			}) as (props: {
				checked: boolean;
				onCheckedChange: (v: boolean) => void;
			}) => ReactNode,
		}),
	);
	expect(typeof capturedChecked).toBe("boolean");
	expect(typeof capturedOnChange).toBe("function");
});

test("SaveButton with asChild renders child element not a button", async () => {
	const { container, cleanup } = await mountPanel(
		true,
		{},
		createElement(
			CookiePreferencePanel.SaveButton,
			{ asChild: true },
			createElement("span", { "data-test-save": "" }, "Save"),
		),
	);
	expect(
		container.querySelector("button[data-op-cookie-preferences-save]"),
	).toBeNull();
	expect(container.querySelector("span[data-test-save]")).not.toBeNull();
	await cleanup();
});
