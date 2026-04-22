import { afterEach, beforeEach, expect, test } from "bun:test";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import type { ThirdPartyEntry } from "./analyse";
import { openPolicy } from "./index";

/**
 * Must match the private constant inside `./index.ts`. Duplicated here so the
 * test doesn't reach into the plugin's internals.
 */
const RESOLVED_VIRTUAL_ID = "\0virtual:openpolicy/auto-collected";

type PluginInstance = ReturnType<typeof openPolicy>;

let tmp: string;

beforeEach(async () => {
	tmp = await mkdtemp(join(tmpdir(), "openpolicy-vite-"));
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

type ScannedResult = {
	dataCollected: Record<string, string[]>;
	thirdParties: ThirdPartyEntry[];
	cookies: { essential: boolean; [key: string]: boolean };
};

/**
 * Calls the plugin's `load` hook with the virtual ID and parses all three
 * exports out of the emitted JS source.
 */
function loadScanned(plugin: PluginInstance): ScannedResult {
	const load = plugin.load as
		| ((id: string) => string | null | undefined)
		| undefined;
	if (!load) throw new Error("plugin has no load hook");
	const source = load.call({}, RESOLVED_VIRTUAL_ID);
	if (!source) throw new Error("load returned falsy");

	const dcStart =
		source.indexOf("dataCollected = ") + "dataCollected = ".length;
	const dcEnd = source.indexOf(";\n", dcStart);
	if (dcStart < "dataCollected = ".length || dcEnd === -1)
		throw new Error(`could not parse dataCollected from: ${source}`);
	const dataCollected = JSON.parse(source.slice(dcStart, dcEnd)) as Record<
		string,
		string[]
	>;

	const tpStart = source.indexOf("thirdParties = ") + "thirdParties = ".length;
	const tpEnd = source.indexOf(";\n", tpStart);
	if (tpStart < "thirdParties = ".length || tpEnd === -1)
		throw new Error(`could not parse thirdParties from: ${source}`);
	const thirdParties = JSON.parse(
		source.slice(tpStart, tpEnd),
	) as ThirdPartyEntry[];

	const ckStart = source.indexOf("cookies = ") + "cookies = ".length;
	const ckEnd = source.indexOf(";\n", ckStart);
	if (ckStart < "cookies = ".length || ckEnd === -1)
		throw new Error(`could not parse cookies from: ${source}`);
	const cookies = JSON.parse(source.slice(ckStart, ckEnd)) as {
		essential: boolean;
		[key: string]: boolean;
	};

	return { dataCollected, thirdParties, cookies };
}

type WatcherEvent = "change" | "add" | "unlink";
type WatcherHandler = (file: string) => void | Promise<void>;

type StubServer = {
	watcherAdded: string[];
	invalidatedIds: string[];
	sentMessages: Array<{ type: string }>;
	loggedErrors: string[];
	runHandler: (event: WatcherEvent, file: string) => Promise<void>;
	// biome-ignore lint/suspicious/noExplicitAny: ad-hoc ViteDevServer stub.
	server: any;
};

/**
 * Builds a minimal stand-in for `ViteDevServer` that captures everything the
 * plugin touches: watcher registrations, module-graph invalidations, WS
 * messages, and logger errors. `runHandler` invokes a registered watcher
 * listener and awaits its async body so tests can assert post-state without
 * a sleep or a microtask dance.
 */
function createStubServer(): StubServer {
	const handlers: Record<WatcherEvent, WatcherHandler[]> = {
		change: [],
		add: [],
		unlink: [],
	};
	const watcherAdded: string[] = [];
	const invalidatedIds: string[] = [];
	const sentMessages: Array<{ type: string }> = [];
	const loggedErrors: string[] = [];

	// biome-ignore lint/suspicious/noExplicitAny: see StubServer.
	const server: any = {
		watcher: {
			add(path: string): void {
				watcherAdded.push(path);
			},
			on(event: WatcherEvent, cb: WatcherHandler): void {
				handlers[event].push(cb);
			},
		},
		moduleGraph: {
			getModuleById(id: string): { id: string } {
				return { id };
			},
			invalidateModule(mod: { id: string }): void {
				invalidatedIds.push(mod.id);
			},
		},
		ws: {
			send(msg: { type: string }): void {
				sentMessages.push(msg);
			},
		},
		config: {
			logger: {
				error(msg: string): void {
					loggedErrors.push(msg);
				},
			},
		},
	};

	async function runHandler(event: WatcherEvent, file: string): Promise<void> {
		for (const cb of handlers[event]) {
			await cb(file);
		}
	}

	return {
		watcherAdded,
		invalidatedIds,
		sentMessages,
		loggedErrors,
		runHandler,
		server,
	};
}

test("load hook returns scanned categories after buildStart", async () => {
	await touch(
		"src/lib/db.ts",
		`
		import { collecting } from "@openpolicy/sdk";
		export function createUser(name: string, email: string) {
			return collecting("Account Information", { name, email }, {
				name: "Name",
				email: "Email address",
			});
		}
		`,
	);

	const plugin = openPolicy();
	await runPluginBuildStart(plugin, tmp);

	expect(loadScanned(plugin).dataCollected).toEqual({
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
		collecting("Account Information", v, { a: "Name", b: "Email" });
		`,
	);
	await touch(
		"src/b-pages.ts",
		`
		import { collecting } from "@openpolicy/sdk";
		collecting("Usage Data", v, { p: "Pages visited" });
		collecting("Account Information", v, { c: "Phone" });
		`,
	);

	const plugin = openPolicy();
	await runPluginBuildStart(plugin, tmp);

	expect(loadScanned(plugin).dataCollected).toEqual({
		"Account Information": ["Name", "Email", "Phone"],
		"Usage Data": ["Pages visited"],
	});
});

test("ignores files outside the configured srcDir", async () => {
	await touch(
		"src/ok.ts",
		`
		import { collecting } from "@openpolicy/sdk";
		collecting("In", v, { x: "X" });
		`,
	);
	await touch(
		"other/nope.ts",
		`
		import { collecting } from "@openpolicy/sdk";
		collecting("Out", v, { x: "X" });
		`,
	);

	const plugin = openPolicy({ srcDir: "src" });
	await runPluginBuildStart(plugin, tmp);

	expect(loadScanned(plugin).dataCollected).toEqual({ In: ["X"] });
});

test("respects a custom srcDir", async () => {
	await touch(
		"app/foo.ts",
		`
		import { collecting } from "@openpolicy/sdk";
		collecting("Cat", v, { x: "X" });
		`,
	);

	const plugin = openPolicy({ srcDir: "app" });
	await runPluginBuildStart(plugin, tmp);

	expect(loadScanned(plugin).dataCollected).toEqual({ Cat: ["X"] });
});

test("emits an empty object when srcDir contains no collecting() calls", async () => {
	await touch("src/noop.ts", `export const x = 1;\n`);

	const plugin = openPolicy();
	await runPluginBuildStart(plugin, tmp);

	expect(loadScanned(plugin).dataCollected).toEqual({});
});

test("emits an empty object when srcDir is missing entirely", async () => {
	const plugin = openPolicy({ srcDir: "missing" });
	await runPluginBuildStart(plugin, tmp);

	expect(loadScanned(plugin).dataCollected).toEqual({});
});

test("scans .tsx files by default", async () => {
	await touch(
		"src/Widget.tsx",
		`
		import { collecting } from "@openpolicy/sdk";
		export function Widget() {
			collecting("Widget", v, { x: "X" });
			return null;
		}
		`,
	);

	const plugin = openPolicy();
	await runPluginBuildStart(plugin, tmp);

	expect(loadScanned(plugin).dataCollected).toEqual({ Widget: ["X"] });
});

test("resolveId redirects ./auto-collected when importer is inside @openpolicy/sdk", async () => {
	const plugin = openPolicy();
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
	const plugin = openPolicy();
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
	const plugin = openPolicy();
	await runPluginBuildStart(plugin, tmp);

	const result = await callResolveId(
		plugin,
		"./something-else",
		"/repo/packages/sdk/src/index.ts",
		{ id: "/repo/packages/sdk/src/something-else.ts" },
	);
	expect(result).toBeNull();
});

test("config hook excludes @openpolicy/sdk from dep pre-bundling and pins it to ssr.noExternal", () => {
	const plugin = openPolicy();
	const configHook = plugin.config as unknown as
		| (() => {
				optimizeDeps?: { exclude?: string[] };
				ssr?: {
					optimizeDeps?: { exclude?: string[] };
					noExternal?: string[] | true;
				};
		  } | void)
		| undefined;
	if (!configHook) throw new Error("plugin has no config hook");

	const result = configHook();
	expect(result?.optimizeDeps?.exclude).toContain("@openpolicy/sdk");
	expect(result?.ssr?.optimizeDeps?.exclude).toContain("@openpolicy/sdk");
	expect(result?.ssr?.noExternal).toContain("@openpolicy/sdk");
});

test("configureServer adds resolvedSrcDir to the chokidar watch set", async () => {
	const plugin = openPolicy();
	await runPluginBuildStart(plugin, tmp);

	const stub = createStubServer();
	await runConfigureServer(plugin, stub.server);

	expect(stub.watcherAdded).toContain(join(tmp, "src"));
});

test("dev watcher re-scans and triggers a full reload when a tracked file changes", async () => {
	await touch(
		"src/lib/db.ts",
		`
		import { collecting } from "@openpolicy/sdk";
		collecting("Initial", v, { x: "X" });
		`,
	);

	const plugin = openPolicy();
	await runPluginBuildStart(plugin, tmp);
	expect(loadScanned(plugin).dataCollected).toEqual({ Initial: ["X"] });

	const stub = createStubServer();
	await runConfigureServer(plugin, stub.server);

	// User adds a second collecting() call — simulate both the file write
	// and the watcher event chokidar would emit.
	await touch(
		"src/lib/db.ts",
		`
		import { collecting } from "@openpolicy/sdk";
		collecting("Initial", v, { x: "X" });
		collecting("Added", v, { y: "Y" });
		`,
	);
	await stub.runHandler("change", join(tmp, "src/lib/db.ts"));

	expect(loadScanned(plugin).dataCollected).toEqual({
		Initial: ["X"],
		Added: ["Y"],
	});
	expect(stub.invalidatedIds).toContain(RESOLVED_VIRTUAL_ID);
	expect(stub.sentMessages).toContainEqual({ type: "full-reload" });
});

test("dev watcher picks up newly-created source files", async () => {
	const plugin = openPolicy();
	await runPluginBuildStart(plugin, tmp);
	expect(loadScanned(plugin).dataCollected).toEqual({});

	const stub = createStubServer();
	await runConfigureServer(plugin, stub.server);

	await touch(
		"src/new.ts",
		`
		import { collecting } from "@openpolicy/sdk";
		collecting("Brand New", v, { z: "Z" });
		`,
	);
	await stub.runHandler("add", join(tmp, "src/new.ts"));

	expect(loadScanned(plugin).dataCollected).toEqual({ "Brand New": ["Z"] });
	expect(stub.sentMessages).toContainEqual({ type: "full-reload" });
});

test("dev watcher drops categories when a file is deleted", async () => {
	await touch(
		"src/gone.ts",
		`
		import { collecting } from "@openpolicy/sdk";
		collecting("Temporary", v, { x: "X" });
		`,
	);

	const plugin = openPolicy();
	await runPluginBuildStart(plugin, tmp);
	expect(loadScanned(plugin).dataCollected).toEqual({ Temporary: ["X"] });

	const stub = createStubServer();
	await runConfigureServer(plugin, stub.server);

	await rm(join(tmp, "src/gone.ts"));
	await stub.runHandler("unlink", join(tmp, "src/gone.ts"));

	expect(loadScanned(plugin).dataCollected).toEqual({});
	expect(stub.sentMessages).toContainEqual({ type: "full-reload" });
});

test("dev watcher ignores events for files outside srcDir", async () => {
	const plugin = openPolicy();
	await runPluginBuildStart(plugin, tmp);

	const stub = createStubServer();
	await runConfigureServer(plugin, stub.server);

	await touch("other/x.ts", `export const x = 1;\n`);
	await stub.runHandler("change", join(tmp, "other/x.ts"));

	expect(stub.invalidatedIds).toHaveLength(0);
	expect(stub.sentMessages).toHaveLength(0);
});

test("dev watcher ignores events for files with untracked extensions", async () => {
	const plugin = openPolicy();
	await runPluginBuildStart(plugin, tmp);

	const stub = createStubServer();
	await runConfigureServer(plugin, stub.server);

	await touch("src/README.md", `# hello\n`);
	await stub.runHandler("change", join(tmp, "src/README.md"));

	expect(stub.invalidatedIds).toHaveLength(0);
	expect(stub.sentMessages).toHaveLength(0);
});

test("dev watcher skips invalidation when the scan output is unchanged", async () => {
	await touch(
		"src/a.ts",
		`
		import { collecting } from "@openpolicy/sdk";
		collecting("A", v, { x: "X" });
		`,
	);

	const plugin = openPolicy();
	await runPluginBuildStart(plugin, tmp);

	const stub = createStubServer();
	await runConfigureServer(plugin, stub.server);

	// Touch the file with a harmless edit that preserves collecting() shape.
	await touch(
		"src/a.ts",
		`
		// comment added
		import { collecting } from "@openpolicy/sdk";
		collecting("A", v, { x: "X" });
		`,
	);
	await stub.runHandler("change", join(tmp, "src/a.ts"));

	expect(stub.invalidatedIds).toHaveLength(0);
	expect(stub.sentMessages).toHaveLength(0);
});

// ---------------------------------------------------------------------------
// thirdParty() integration tests
// ---------------------------------------------------------------------------

test("thirdParty() calls are scanned and appear in virtual module thirdParties export", async () => {
	await touch(
		"src/payments.ts",
		`
		import { thirdParty } from "@openpolicy/sdk";
		thirdParty("Stripe", "Payments", "https://stripe.com/privacy");
		`,
	);

	const plugin = openPolicy();
	await runPluginBuildStart(plugin, tmp);

	expect(loadScanned(plugin).thirdParties).toEqual([
		{
			name: "Stripe",
			purpose: "Payments",
			policyUrl: "https://stripe.com/privacy",
		},
	]);
});

test("thirdParty() deduplication across files — same name in two files yields one entry", async () => {
	// Files are walked in sorted order: a-file.ts before b-file.ts.
	// First occurrence wins.
	await touch(
		"src/a-file.ts",
		`
		import { thirdParty } from "@openpolicy/sdk";
		thirdParty("Stripe", "Payments", "https://stripe.com/privacy");
		`,
	);
	await touch(
		"src/b-file.ts",
		`
		import { thirdParty } from "@openpolicy/sdk";
		thirdParty("Stripe", "Billing", "https://stripe.com/other");
		`,
	);

	const plugin = openPolicy();
	await runPluginBuildStart(plugin, tmp);

	expect(loadScanned(plugin).thirdParties).toEqual([
		{
			name: "Stripe",
			purpose: "Payments",
			policyUrl: "https://stripe.com/privacy",
		},
	]);
});

test("dev watcher triggers reload when thirdParty() call is added", async () => {
	await touch("src/payments.ts", `export const x = 1;\n`);

	const plugin = openPolicy();
	await runPluginBuildStart(plugin, tmp);
	expect(loadScanned(plugin).thirdParties).toEqual([]);

	const stub = createStubServer();
	await runConfigureServer(plugin, stub.server);

	await touch(
		"src/payments.ts",
		`
		import { thirdParty } from "@openpolicy/sdk";
		thirdParty("Stripe", "Payments", "https://stripe.com/privacy");
		`,
	);
	await stub.runHandler("change", join(tmp, "src/payments.ts"));

	expect(loadScanned(plugin).thirdParties).toEqual([
		{
			name: "Stripe",
			purpose: "Payments",
			policyUrl: "https://stripe.com/privacy",
		},
	]);
	expect(stub.invalidatedIds).toContain(RESOLVED_VIRTUAL_ID);
	expect(stub.sentMessages).toContainEqual({ type: "full-reload" });
});

// ---------------------------------------------------------------------------
// usePackageJson tests
// ---------------------------------------------------------------------------

test("usePackageJson is disabled by default — package.json with stripe does not add entries", async () => {
	await touch(
		"package.json",
		JSON.stringify({ dependencies: { stripe: "^14.0.0" } }),
	);

	const plugin = openPolicy();
	await runPluginBuildStart(plugin, tmp);

	expect(loadScanned(plugin).thirdParties).toEqual([]);
});

test("usePackageJson: known package is detected and added as ThirdPartyEntry", async () => {
	await touch(
		"package.json",
		JSON.stringify({ dependencies: { stripe: "^14.0.0" } }),
	);

	const plugin = openPolicy({ thirdParties: { usePackageJson: true } });
	await runPluginBuildStart(plugin, tmp);

	const { thirdParties } = loadScanned(plugin);
	expect(thirdParties).toHaveLength(1);
	expect(thirdParties[0]?.name).toBe("Stripe");
	expect(thirdParties[0]?.purpose).toBe("Payment processing");
});

test("usePackageJson: unknown package is silently ignored", async () => {
	await touch(
		"package.json",
		JSON.stringify({ dependencies: { "some-unknown-pkg": "^1.0.0" } }),
	);

	const plugin = openPolicy({ thirdParties: { usePackageJson: true } });
	await runPluginBuildStart(plugin, tmp);

	expect(loadScanned(plugin).thirdParties).toEqual([]);
});

test("usePackageJson: multiple packages mapping to same service yield one entry", async () => {
	await touch(
		"package.json",
		JSON.stringify({
			dependencies: { stripe: "^14.0.0", "@stripe/stripe-js": "^3.0.0" },
		}),
	);

	const plugin = openPolicy({ thirdParties: { usePackageJson: true } });
	await runPluginBuildStart(plugin, tmp);

	const { thirdParties } = loadScanned(plugin);
	expect(thirdParties.filter((e) => e.name === "Stripe")).toHaveLength(1);
});

test("usePackageJson: manual thirdParty() call wins over auto-detected entry", async () => {
	await touch(
		"package.json",
		JSON.stringify({ dependencies: { stripe: "^14.0.0" } }),
	);
	await touch(
		"src/payments.ts",
		`
		import { thirdParty } from "@openpolicy/sdk";
		thirdParty("Stripe", "Custom billing purpose", "https://stripe.com/custom");
		`,
	);

	const plugin = openPolicy({ thirdParties: { usePackageJson: true } });
	await runPluginBuildStart(plugin, tmp);

	const { thirdParties } = loadScanned(plugin);
	const stripeEntries = thirdParties.filter((e) => e.name === "Stripe");
	expect(stripeEntries).toHaveLength(1);
	expect(stripeEntries[0]?.purpose).toBe("Custom billing purpose");
	expect(stripeEntries[0]?.policyUrl).toBe("https://stripe.com/custom");
});

test("usePackageJson: graceful when package.json is missing", async () => {
	await touch(
		"src/payments.ts",
		`
		import { thirdParty } from "@openpolicy/sdk";
		thirdParty("Stripe", "Payments", "https://stripe.com/privacy");
		`,
	);

	const plugin = openPolicy({ thirdParties: { usePackageJson: true } });
	await runPluginBuildStart(plugin, tmp);

	expect(loadScanned(plugin).thirdParties).toEqual([
		{
			name: "Stripe",
			purpose: "Payments",
			policyUrl: "https://stripe.com/privacy",
		},
	]);
});

// ---------------------------------------------------------------------------
// cookie detection tests
// ---------------------------------------------------------------------------

test("cookies: empty scan emits essential-only map", async () => {
	await touch("src/noop.ts", `export const x = 1;\n`);

	const plugin = openPolicy();
	await runPluginBuildStart(plugin, tmp);

	expect(loadScanned(plugin).cookies).toEqual({ essential: true });
});

test("cookies: defineCookie() adds the category", async () => {
	await touch(
		"src/cookies.ts",
		`
		import { defineCookie } from "@openpolicy/sdk";
		defineCookie("analytics");
		defineCookie("marketing");
		`,
	);

	const plugin = openPolicy();
	await runPluginBuildStart(plugin, tmp);

	expect(loadScanned(plugin).cookies).toEqual({
		essential: true,
		analytics: true,
		marketing: true,
	});
});

test("cookies: ConsentGate usage adds the category", async () => {
	await touch(
		"src/Widget.tsx",
		`
		import { ConsentGate } from "@openpolicy/react";
		export function Widget() {
			return <ConsentGate requires="analytics">hi</ConsentGate>;
		}
		`,
	);

	const plugin = openPolicy();
	await runPluginBuildStart(plugin, tmp);

	expect(loadScanned(plugin).cookies).toEqual({
		essential: true,
		analytics: true,
	});
});

test("cookies: useCookies().has() adds the category (including nested expr)", async () => {
	await touch(
		"src/hook.ts",
		`
		import { useCookies } from "@openpolicy/react";
		export function X() {
			return useCookies().has({ or: ["analytics", "marketing"] });
		}
		`,
	);

	const plugin = openPolicy();
	await runPluginBuildStart(plugin, tmp);

	expect(loadScanned(plugin).cookies).toEqual({
		essential: true,
		analytics: true,
		marketing: true,
	});
});

test("cookies: usePackageJson disabled by default — posthog-js alone does not add analytics", async () => {
	await touch(
		"package.json",
		JSON.stringify({ dependencies: { "posthog-js": "^1.0.0" } }),
	);

	const plugin = openPolicy();
	await runPluginBuildStart(plugin, tmp);

	expect(loadScanned(plugin).cookies).toEqual({ essential: true });
});

test("cookies: usePackageJson — posthog-js detected as analytics", async () => {
	await touch(
		"package.json",
		JSON.stringify({ dependencies: { "posthog-js": "^1.0.0" } }),
	);

	const plugin = openPolicy({ cookies: { usePackageJson: true } });
	await runPluginBuildStart(plugin, tmp);

	expect(loadScanned(plugin).cookies).toEqual({
		essential: true,
		analytics: true,
	});
});

test("cookies: usePackageJson + defineCookie unions categories", async () => {
	await touch(
		"package.json",
		JSON.stringify({ dependencies: { "posthog-js": "^1.0.0" } }),
	);
	await touch(
		"src/cookies.ts",
		`
		import { defineCookie } from "@openpolicy/sdk";
		defineCookie("marketing");
		`,
	);

	const plugin = openPolicy({ cookies: { usePackageJson: true } });
	await runPluginBuildStart(plugin, tmp);

	expect(loadScanned(plugin).cookies).toEqual({
		essential: true,
		analytics: true,
		marketing: true,
	});
});

test("cookies: usePackageJson graceful when package.json missing", async () => {
	const plugin = openPolicy({ cookies: { usePackageJson: true } });
	await runPluginBuildStart(plugin, tmp);

	expect(loadScanned(plugin).cookies).toEqual({ essential: true });
});

test("cookies: dev watcher reloads when a cookie-relevant call is added", async () => {
	await touch("src/x.ts", `export const x = 1;\n`);

	const plugin = openPolicy();
	await runPluginBuildStart(plugin, tmp);
	expect(loadScanned(plugin).cookies).toEqual({ essential: true });

	const stub = createStubServer();
	await runConfigureServer(plugin, stub.server);

	await touch(
		"src/x.ts",
		`
		import { defineCookie } from "@openpolicy/sdk";
		defineCookie("analytics");
		`,
	);
	await stub.runHandler("change", join(tmp, "src/x.ts"));

	expect(loadScanned(plugin).cookies).toEqual({
		essential: true,
		analytics: true,
	});
	expect(stub.invalidatedIds).toContain(RESOLVED_VIRTUAL_ID);
	expect(stub.sentMessages).toContainEqual({ type: "full-reload" });
});

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

/**
 * Invokes the plugin's `configureServer` hook with the given stub. Handles
 * both the plain-function and object-hook shapes that Vite allows.
 */
function runConfigureServer(
	plugin: PluginInstance,
	// biome-ignore lint/suspicious/noExplicitAny: see StubServer.
	server: any,
): void | Promise<void> {
	const hook = plugin.configureServer as unknown;
	if (typeof hook === "function") {
		return (hook as (s: unknown) => void | Promise<void>)(server);
	}
	if (hook && typeof (hook as { handler?: unknown }).handler === "function") {
		return (hook as { handler: (s: unknown) => void | Promise<void> }).handler(
			server,
		);
	}
	throw new Error("plugin has no configureServer hook");
}
