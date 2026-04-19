import { execFile as execFileCb } from "node:child_process";
import { copyFile, readdir, rm, unlink } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";

const execFile = promisify(execFileCb);

export const EXAMPLE_DIR = join(
	import.meta.dirname,
	"..",
	"..",
	"examples",
	"tanstack",
);
const PATCHES_DIR = join(
	import.meta.dirname,
	"scenarios",
	"baseline",
	"patches",
);

export type ScenarioName = "baseline" | "full";

export type Scenario = {
	name: ScenarioName;
	apply: () => Promise<void>;
	restore: () => Promise<void>;
};

async function assertClean() {
	const { stdout } = await execFile("git", ["status", "-s", EXAMPLE_DIR]);
	if (stdout.trim().length > 0) {
		throw new Error(
			`examples/tanstack has uncommitted changes — refusing to run bench.\n${stdout}`,
		);
	}
}

async function gitRestoreExample() {
	// Restore tracked files
	await execFile("git", ["checkout", "HEAD", "--", EXAMPLE_DIR]);
	// Remove any files we created that aren't tracked (none expected, but be safe)
	await execFile("git", ["clean", "-fd", EXAMPLE_DIR]);
}

const OPENPOLICY_ROUTES = [
	"cookie-banner.tsx",
	"css-vars.tsx",
	"shadcn.tsx",
	"tailwind.tsx",
];

const OPENPOLICY_FILES = [
	"src/openpolicy.ts",
	"src/lib/collection.ts",
	"src/lib/stripe.ts",
];

export const scenarios: Record<ScenarioName, Scenario> = {
	full: {
		name: "full",
		apply: async () => {
			await assertClean();
		},
		restore: async () => {
			// nothing to do — full scenario made no changes
		},
	},
	baseline: {
		name: "baseline",
		apply: async () => {
			await assertClean();

			// Replace root + index + vite.config with stripped variants
			await copyFile(
				join(PATCHES_DIR, "__root.tsx"),
				join(EXAMPLE_DIR, "src/routes/__root.tsx"),
			);
			await copyFile(
				join(PATCHES_DIR, "index.tsx"),
				join(EXAMPLE_DIR, "src/routes/index.tsx"),
			);
			await copyFile(
				join(PATCHES_DIR, "vite.config.ts"),
				join(EXAMPLE_DIR, "vite.config.ts"),
			);

			// Delete routes that import from @openpolicy/*
			for (const file of OPENPOLICY_ROUTES) {
				await unlink(join(EXAMPLE_DIR, "src/routes", file)).catch(() => {});
			}
			// Delete openpolicy config + scanner fixture files
			for (const rel of OPENPOLICY_FILES) {
				await unlink(join(EXAMPLE_DIR, rel)).catch(() => {});
			}
			// Delete the compiled policies directory (part of "full" bundle)
			await rm(join(EXAMPLE_DIR, "src/policies"), {
				recursive: true,
				force: true,
			});

			// Remove generated route tree so tanstackStart regenerates it for the stripped routes
			await unlink(join(EXAMPLE_DIR, "src/routeTree.gen.ts")).catch(() => {});
		},
		restore: gitRestoreExample,
	},
};

export async function listExampleDir(): Promise<string[]> {
	const entries = await readdir(EXAMPLE_DIR, { withFileTypes: true });
	return entries.map((e) => e.name);
}
