import { expect, mock, test } from "bun:test";
import { openPolicy } from "./index";

test("integration has correct name", () => {
	const integration = openPolicy();
	expect(integration.name).toBe("@openpolicy/astro");
});

test("openPolicy() does not throw with no args", () => {
	expect(() => openPolicy()).not.toThrow();
});

test("astro:config:setup hook calls updateConfig with vite.plugins", () => {
	const integration = openPolicy();
	const updateConfig = mock(
		(_config: { vite?: { plugins?: unknown[] } }) => {},
	);

	const hook = integration.hooks["astro:config:setup"];
	// @ts-expect-error partial mock
	hook({ updateConfig });

	expect(updateConfig).toHaveBeenCalledTimes(1);
	const calls = updateConfig.mock.calls as Array<
		[{ vite: { plugins: unknown[] } }]
	>;
	const config = calls[0]?.[0];
	expect(Array.isArray(config?.vite.plugins)).toBe(true);
	expect(config?.vite.plugins.length).toBeGreaterThan(0);
});
