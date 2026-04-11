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

	const plugin = autoCollect({ srcDir: "src" });
	await runPluginBuildStart(plugin, tmp);

	expect(loadScanned(plugin)).toEqual({ In: ["X"] });
});

test("respects a custom srcDir", async () => {
	await touch(
		"app/foo.ts",
		`
		import { collecting } from "@openpolicy/sdk";
		collecting("Cat", v, { x: "X" });
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
			collecting("Widget", v, { x: "X" });
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

test("configureServer adds resolvedSrcDir to the chokidar watch set", async () => {
	const plugin = autoCollect();
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

	const plugin = autoCollect();
	await runPluginBuildStart(plugin, tmp);
	expect(loadScanned(plugin)).toEqual({ Initial: ["X"] });

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

	expect(loadScanned(plugin)).toEqual({
		Initial: ["X"],
		Added: ["Y"],
	});
	expect(stub.invalidatedIds).toContain(RESOLVED_VIRTUAL_ID);
	expect(stub.sentMessages).toContainEqual({ type: "full-reload" });
});

test("dev watcher picks up newly-created source files", async () => {
	const plugin = autoCollect();
	await runPluginBuildStart(plugin, tmp);
	expect(loadScanned(plugin)).toEqual({});

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

	expect(loadScanned(plugin)).toEqual({ "Brand New": ["Z"] });
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

	const plugin = autoCollect();
	await runPluginBuildStart(plugin, tmp);
	expect(loadScanned(plugin)).toEqual({ Temporary: ["X"] });

	const stub = createStubServer();
	await runConfigureServer(plugin, stub.server);

	await rm(join(tmp, "src/gone.ts"));
	await stub.runHandler("unlink", join(tmp, "src/gone.ts"));

	expect(loadScanned(plugin)).toEqual({});
	expect(stub.sentMessages).toContainEqual({ type: "full-reload" });
});

test("dev watcher ignores events for files outside srcDir", async () => {
	const plugin = autoCollect();
	await runPluginBuildStart(plugin, tmp);

	const stub = createStubServer();
	await runConfigureServer(plugin, stub.server);

	await touch("other/x.ts", `export const x = 1;\n`);
	await stub.runHandler("change", join(tmp, "other/x.ts"));

	expect(stub.invalidatedIds).toHaveLength(0);
	expect(stub.sentMessages).toHaveLength(0);
});

test("dev watcher ignores events for files with untracked extensions", async () => {
	const plugin = autoCollect();
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

	const plugin = autoCollect();
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
