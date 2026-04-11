import { afterEach, beforeEach, expect, test } from "bun:test";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { autoCollect } from "./index";

/**
 * Must match the private constant inside `./index.ts`. Duplicated here so the
 * test doesn't reach into the plugin's internals.
 */
const RESOLVED_VIRTUAL_ID = "\0virtual:openpolicy/auto-collected";

type PluginInstance = ReturnType<typeof autoCollect>;

let tmp: string;

beforeEach(async () => {
	tmp = await mkdtemp(join(tmpdir(), "openpolicy-autocollect-"));
});

afterEach(async () => {
	await rm(tmp, { recursive: true, force: true });
});

async function touch(rel: string, content: string): Promise<void> {
	const full = join(tmp, rel);
	await mkdir(dirname(full), { recursive: true });
	await writeFile(full, content, "utf8");
}

/**
 * Invokes `configResolved` and `buildStart` in the order Vite would, so the
 * plugin's internal `scanned` state is populated.
 */
async function runPluginBuildStart(
	plugin: PluginInstance,
	root: string,
): Promise<void> {
	const configResolved = plugin.configResolved as
		| ((config: { root: string }) => void | Promise<void>)
		| undefined;
	if (configResolved) await configResolved({ root });
	const buildStart = plugin.buildStart as
		| (() => void | Promise<void>)
		| undefined;
	if (buildStart) await buildStart.call({});
}

/**
 * Calls the plugin's `load` hook with the virtual ID and parses the scanned
 * object out of the emitted JS source. Going through `JSON.parse` means the
 * assertions don't depend on the serialiser's output format.
 */
function loadScanned(plugin: PluginInstance): Record<string, string[]> {
	const load = plugin.load as
		| ((id: string) => string | null | undefined)
		| undefined;
	if (!load) throw new Error("plugin has no load hook");
	const source = load.call({}, RESOLVED_VIRTUAL_ID);
	if (!source) throw new Error("load returned falsy");
	const match = source.match(/= (\{[\s\S]*?\});/);
	if (!match?.[1]) throw new Error(`could not parse load output: ${source}`);
	return JSON.parse(match[1]);
}

/**
 * Calls the plugin's `resolveId` hook with a stubbed Vite context whose
 * `this.resolve` returns a fixed fake resolution.
 */
async function callResolveId(
	plugin: PluginInstance,
	source: string,
	importer: string | undefined,
	fakeResolved: { id: string } | null,
): Promise<string | null> {
	const hook = plugin.resolveId as unknown as (
		this: { resolve: () => Promise<{ id: string } | null> },
		source: string,
		importer: string | undefined,
		options: Record<string, unknown>,
	) => Promise<string | null>;
	const context = {
		async resolve(): Promise<{ id: string } | null> {
			return fakeResolved;
		},
	};
	return hook.call(context, source, importer, {});
}

test("load hook returns scanned categories after buildStart", async () => {
	await touch(
		"src/lib/db.ts",
		`
		import { collecting } from "@openpolicy/sdk";
		export function createUser(name: string, email: string) {
			return collecting("Account Information", { name, email }, (v) => ({
				Name: v.name,
				"Email address": v.email,
			}));
		}
		`,
	);

	const plugin = autoCollect();
	await runPluginBuildStart(plugin, tmp);

	expect(loadScanned(plugin)).toEqual({
		"Account Information": ["Name", "Email address"],
	});
});

test("merges calls across multiple files", async () => {
	// Files are walked in sorted order, so `a-users.ts` runs before
	// `b-pages.ts`. Label order reflects first-seen insertion.
	await touch(
		"src/a-users.ts",
		`
		import { collecting } from "@openpolicy/sdk";
		collecting("Account Information", v, (v) => ({ Name: v.a, Email: v.b }));
		`,
	);
	await touch(
		"src/b-pages.ts",
		`
		import { collecting } from "@openpolicy/sdk";
		collecting("Usage Data", v, (v) => ({ "Pages visited": v.p }));
		collecting("Account Information", v, (v) => ({ Phone: v.c }));
		`,
	);

	const plugin = autoCollect();
	await runPluginBuildStart(plugin, tmp);

	expect(loadScanned(plugin)).toEqual({
		"Account Information": ["Name", "Email", "Phone"],
		"Usage Data": ["Pages visited"],
	});
});

test("ignores files outside the configured srcDir", async () => {
	await touch(
		"src/ok.ts",
		`
		import { collecting } from "@openpolicy/sdk";
		collecting("In", v, (v) => ({ X: v.x }));
		`,
	);
	await touch(
		"other/nope.ts",
		`
		import { collecting } from "@openpolicy/sdk";
		collecting("Out", v, (v) => ({ X: v.x }));
		`,
	);

	const plugin = autoCollect({ srcDir: "src" });
	await runPluginBuildStart(plugin, tmp);

	expect(loadScanned(plugin)).toEqual({ In: ["X"] });
});

test("respects a custom srcDir", async () => {
	await touch(
		"app/foo.ts",
		`
		import { collecting } from "@openpolicy/sdk";
		collecting("Cat", v, (v) => ({ X: v.x }));
		`,
	);

	const plugin = autoCollect({ srcDir: "app" });
	await runPluginBuildStart(plugin, tmp);

	expect(loadScanned(plugin)).toEqual({ Cat: ["X"] });
});

test("emits an empty object when srcDir contains no collecting() calls", async () => {
	await touch("src/noop.ts", `export const x = 1;\n`);

	const plugin = autoCollect();
	await runPluginBuildStart(plugin, tmp);

	expect(loadScanned(plugin)).toEqual({});
});

test("emits an empty object when srcDir is missing entirely", async () => {
	const plugin = autoCollect({ srcDir: "missing" });
	await runPluginBuildStart(plugin, tmp);

	expect(loadScanned(plugin)).toEqual({});
});

test("scans .tsx files by default", async () => {
	await touch(
		"src/Widget.tsx",
		`
		import { collecting } from "@openpolicy/sdk";
		export function Widget() {
			collecting("Widget", v, (v) => ({ X: v.x }));
			return null;
		}
		`,
	);

	const plugin = autoCollect();
	await runPluginBuildStart(plugin, tmp);

	expect(loadScanned(plugin)).toEqual({ Widget: ["X"] });
});

test("resolveId redirects ./auto-collected when importer is inside @openpolicy/sdk", async () => {
	const plugin = autoCollect();
	await runPluginBuildStart(plugin, tmp);

	// Published install layout uses the dist `./auto-collected.js` specifier.
	const nodeModulesResult = await callResolveId(
		plugin,
		"./auto-collected.js",
		"/app/node_modules/@openpolicy/sdk/dist/index.js",
		{ id: "/app/node_modules/@openpolicy/sdk/dist/auto-collected.js" },
	);
	expect(nodeModulesResult).toBe(RESOLVED_VIRTUAL_ID);

	// Workspace source layout uses the bare `./auto-collected` specifier.
	const workspaceResult = await callResolveId(
		plugin,
		"./auto-collected",
		"/repo/packages/sdk/src/index.ts",
		{ id: "/repo/packages/sdk/src/auto-collected.ts" },
	);
	expect(workspaceResult).toBe(RESOLVED_VIRTUAL_ID);
});

test("resolveId leaves unrelated ./auto-collected imports alone", async () => {
	const plugin = autoCollect();
	await runPluginBuildStart(plugin, tmp);

	const result = await callResolveId(
		plugin,
		"./auto-collected",
		"/some/other/package/index.js",
		{ id: "/some/other/package/auto-collected.js" },
	);
	expect(result).toBeNull();
});

test("resolveId ignores specifiers other than ./auto-collected", async () => {
	const plugin = autoCollect();
	await runPluginBuildStart(plugin, tmp);

	const result = await callResolveId(
		plugin,
		"./something-else",
		"/repo/packages/sdk/src/index.ts",
		{ id: "/repo/packages/sdk/src/something-else.ts" },
	);
	expect(result).toBeNull();
});
