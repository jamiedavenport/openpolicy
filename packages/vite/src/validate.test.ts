import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, expect, test } from "vite-plus/test";
import type { Scanned } from "./scanned";
import { loadAndValidateConfig } from "./validate";

/**
 * Tmp dirs sit inside the workspace root so node_modules resolution can
 * find `@openpolicy/sdk` (a workspace symlink at the repo's `node_modules/`).
 * `tmpdir()` would put us outside the workspace and the SDK would fail to
 * resolve from inside `bundle-require`'s esbuild pass.
 */
const WORKSPACE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

let tmp: string;

beforeEach(async () => {
	tmp = await mkdtemp(join(WORKSPACE_ROOT, ".tmp-validate-"));
});

afterEach(async () => {
	await rm(tmp, { recursive: true, force: true });
});

async function writeConfig(source: string): Promise<string> {
	const file = join(tmp, "openpolicy.ts");
	await mkdir(dirname(file), { recursive: true });
	await writeFile(file, source, "utf8");
	return file;
}

const EMPTY_SCANNED: Scanned = {
	dataCollected: {},
	thirdParties: [],
	cookies: { essential: true },
};

const VALID_CONFIG = `
import { ContractPrerequisite, defineConfig, LegalBases } from "@openpolicy/sdk";

export default defineConfig({
	company: {
		name: "Acme Inc.",
		legalName: "Acme Corporation",
		address: "123 Main St, Springfield, USA",
		contact: { email: "privacy@acme.com" },
		dpo: { required: false, reason: "small-scale processing" },
	},
	effectiveDate: "2026-01-01",
	jurisdictions: ["eu"],
	data: {
		collected: { "Account Information": ["Name", "Email"] },
		context: {
			"Account Information": {
				purpose: "To authenticate users",
				lawfulBasis: LegalBases.Contract,
				retention: "Until deletion",
				provision: ContractPrerequisite("We cannot create or operate your account."),
			},
		},
	},
	automatedDecisionMaking: [],
});
`;

test("returns no issues for a complete valid config", async () => {
	const file = await writeConfig(VALID_CONFIG);
	const result = await loadAndValidateConfig({ configFile: file, scanned: EMPTY_SCANNED });
	expect(result.loadError).toBeNull();
	expect(result.config).not.toBeNull();
	expect(result.issues).toEqual([]);
});

test("surfaces effective-date-required as an error", async () => {
	const file = await writeConfig(VALID_CONFIG.replace('effectiveDate: "2026-01-01",', ""));
	const result = await loadAndValidateConfig({ configFile: file, scanned: EMPTY_SCANNED });
	expect(result.loadError).toBeNull();
	const hit = result.issues.find((i) => i.code === "effective-date-required");
	expect(hit).toBeDefined();
	expect(hit?.level).toBe("error");
});

test("surfaces company-contact-phone-recommended warning under us-ca", async () => {
	const file = await writeConfig(
		VALID_CONFIG.replace('jurisdictions: ["eu"],', 'jurisdictions: ["us-ca"],'),
	);
	const result = await loadAndValidateConfig({ configFile: file, scanned: EMPTY_SCANNED });
	expect(result.loadError).toBeNull();
	const hit = result.issues.find((i) => i.code === "company-contact-phone-recommended");
	expect(hit).toBeDefined();
	expect(hit?.level).toBe("warning");
});

test("shims scanned data into the SDK so spread `...dataCollected` is visible to validators", async () => {
	// User config spreads `...dataCollected` but doesn't add a matching
	// context entry for the scanned-only category. Without the shim, the
	// SDK's empty fallback would mean the validators see no scanned key
	// and miss the issue. With the shim, the scanned key flows through
	// `data.collected` and the missing-context check fires.
	const source = `
import { ContractPrerequisite, dataCollected, defineConfig, LegalBases } from "@openpolicy/sdk";

export default defineConfig({
	company: {
		name: "Acme Inc.",
		legalName: "Acme Corporation",
		address: "123 Main St, Springfield, USA",
		contact: { email: "privacy@acme.com" },
		dpo: { required: false, reason: "small-scale processing" },
	},
	effectiveDate: "2026-01-01",
	jurisdictions: ["eu"],
	data: {
		collected: { ...dataCollected },
		context: {},
	},
	automatedDecisionMaking: [],
});
`;
	const file = await writeConfig(source);
	const scanned: Scanned = {
		dataCollected: { "Browser Telemetry": ["User-Agent"] },
		thirdParties: [],
		cookies: { essential: true },
	};
	const result = await loadAndValidateConfig({ configFile: file, scanned });
	expect(result.loadError).toBeNull();
	const hit = result.issues.find((i) => i.message.includes("Browser Telemetry"));
	expect(hit).toBeDefined();
});

test("dedupes issues with the same code+message across validators", async () => {
	// effective-date-required is checked by every validator. With the field
	// missing, all three would report it — the dedupe pass should leave one.
	const file = await writeConfig(VALID_CONFIG.replace('effectiveDate: "2026-01-01",', ""));
	const result = await loadAndValidateConfig({ configFile: file, scanned: EMPTY_SCANNED });
	const matches = result.issues.filter((i) => i.code === "effective-date-required");
	expect(matches.length).toBe(1);
});

test("captures load errors instead of throwing", async () => {
	const file = await writeConfig("export default this is not valid typescript;");
	const result = await loadAndValidateConfig({ configFile: file, scanned: EMPTY_SCANNED });
	expect(result.loadError).toBeInstanceOf(Error);
	expect(result.config).toBeNull();
	expect(result.issues).toEqual([]);
});

test("captures missing default export as a load error", async () => {
	const file = await writeConfig(`export const notDefault = 1;`);
	const result = await loadAndValidateConfig({ configFile: file, scanned: EMPTY_SCANNED });
	expect(result.loadError).toBeInstanceOf(Error);
	expect(result.loadError?.message).toContain("no default export");
});
