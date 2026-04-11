import { afterEach, beforeEach, expect, test } from "bun:test";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { __setAutoCollectedRegistry, autoCollected } from "@openpolicy/sdk";
import { autoCollect } from "./index";

let tmp: string;

beforeEach(async () => {
	tmp = await mkdtemp(join(tmpdir(), "openpolicy-autocollect-"));
	__setAutoCollectedRegistry({});
});

afterEach(async () => {
	await rm(tmp, { recursive: true, force: true });
	__setAutoCollectedRegistry({});
});

async function touch(rel: string, content: string): Promise<void> {
	const full = join(tmp, rel);
	await mkdir(dirname(full), { recursive: true });
	await writeFile(full, content, "utf8");
}

/**
 * Invoke the plugin hooks in the same order Vite would: `configResolved`
 * first, then `buildStart`. This avoids spinning up a full Vite dev server
 * while still exercising the real code path.
 */
async function runPlugin(
	plugin: ReturnType<typeof autoCollect>,
	root: string,
): Promise<void> {
	const configResolved = plugin.configResolved as
		| ((config: { root: string }) => void | Promise<void>)
		| undefined;
	if (configResolved) await configResolved({ root });
	const buildStart = plugin.buildStart as
		| (() => void | Promise<void>)
		| undefined;
	if (buildStart) await buildStart();
}

test("populates autoCollected() from a single source file", async () => {
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

	await runPlugin(autoCollect(), tmp);

	expect(autoCollected()).toEqual({
		"Account Information": ["Name", "Email address"],
	});
});

test("merges calls across multiple files", async () => {
	// Files are visited in sorted order, so `a-users.ts` runs before
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

	await runPlugin(autoCollect(), tmp);

	expect(autoCollected()).toEqual({
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

	await runPlugin(autoCollect({ srcDir: "src" }), tmp);

	expect(autoCollected()).toEqual({ In: ["X"] });
});

test("respects a custom srcDir", async () => {
	await touch(
		"app/foo.ts",
		`
		import { collecting } from "@openpolicy/sdk";
		collecting("Cat", v, (v) => ({ X: v.x }));
		`,
	);

	await runPlugin(autoCollect({ srcDir: "app" }), tmp);

	expect(autoCollected()).toEqual({ Cat: ["X"] });
});

test("populates {} when srcDir contains no collecting() calls", async () => {
	await touch("src/noop.ts", `export const x = 1;\n`);

	// Seed registry with stale data to prove buildStart resets it.
	__setAutoCollectedRegistry({ Stale: ["Value"] });

	await runPlugin(autoCollect(), tmp);

	expect(autoCollected()).toEqual({});
});

test("populates {} when srcDir is missing entirely", async () => {
	await runPlugin(autoCollect({ srcDir: "missing" }), tmp);
	expect(autoCollected()).toEqual({});
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

	await runPlugin(autoCollect(), tmp);

	expect(autoCollected()).toEqual({ Widget: ["X"] });
});
