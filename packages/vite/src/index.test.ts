import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { generatePolicies, openPolicy, writeScaffold } from "./index";

// --- Group 1: Plugin structure ---

describe("plugin structure", () => {
	test("openPolicy returns a vite plugin with correct name", () => {
		const plugin = openPolicy();
		expect(plugin.name).toBe("openpolicy");
	});

	test("openPolicy() with no args does not throw", () => {
		expect(() => openPolicy()).not.toThrow();
	});

	test("openPolicy() with partial args does not throw", () => {
		expect(() => openPolicy({ formats: ["markdown"] })).not.toThrow();
		expect(() => openPolicy({ config: "custom.config.ts" })).not.toThrow();
		expect(() => openPolicy({ outDir: "dist/policies" })).not.toThrow();
	});

	test("openPolicy() with configs array does not throw", () => {
		expect(() =>
			openPolicy({ configs: ["policy.config.ts", "terms.config.ts"] }),
		).not.toThrow();
	});
});

// --- Group 2: Scaffold ---

describe("writeScaffold", () => {
	test("creates file with definePrivacyPolicy and today's date", async () => {
		const tmpDir = await mkdtemp(join(tmpdir(), "openpolicy-vite-scaffold-"));
		try {
			const configPath = join(tmpDir, "privacy.config.ts");
			await writeScaffold(configPath);

			expect(existsSync(configPath)).toBe(true);

			const content = await readFile(configPath, "utf8");
			expect(content).toContain("definePrivacyPolicy");
			expect(content).toContain(new Date().toISOString().slice(0, 10));
			expect(content).toContain("effectiveDate");
			expect(content).toContain("@openpolicy/sdk");
		} finally {
			await rm(tmpDir, { recursive: true });
		}
	});
});

// --- Group 3: generatePolicies ---

const validConfig = `
export default {
  effectiveDate: "2026-01-01",
  company: {
    name: "Test Co",
    legalName: "Test Co, Inc.",
    address: "1 Test Ave, Testville, TX 12345",
    contact: "privacy@test.com",
  },
  dataCollected: {
    "Usage Data": ["Page views", "Session duration"],
  },
  legalBasis: "Legitimate interests",
  retention: {
    "Usage Data": "90 days",
  },
  cookies: { essential: true, analytics: true, marketing: false },
  thirdParties: [],
  userRights: ["access", "erasure"],
  jurisdictions: ["us"],
};
`;

describe("generatePolicies", () => {
	test("writes privacy-policy.md for markdown format", async () => {
		const tmpDir = await mkdtemp(join(tmpdir(), "openpolicy-vite-gen-"));
		try {
			const configPath = join(tmpDir, "policy.config.ts");
			await Bun.write(configPath, validConfig);

			const outDir = join(tmpDir, "out");
			await generatePolicies(configPath, outDir, ["markdown"]);

			const outFile = join(outDir, "privacy-policy.md");
			expect(existsSync(outFile)).toBe(true);

			const content = await readFile(outFile, "utf8");
			expect(content.length).toBeGreaterThan(0);
		} finally {
			await rm(tmpDir, { recursive: true });
		}
	});

	test("throws on config with validation errors", async () => {
		const tmpDir = await mkdtemp(join(tmpdir(), "openpolicy-vite-invalid-"));
		try {
			const invalidConfig = `
export default {
  effectiveDate: "",
  company: { name: "", legalName: "", address: "", contact: "" },
  dataCollected: {},
  legalBasis: "",
  retention: {},
  cookies: { essential: true, analytics: false, marketing: false },
  thirdParties: [],
  userRights: [],
  jurisdictions: ["us"],
};
`;
			const configPath = join(tmpDir, "bad.config.ts");
			await Bun.write(configPath, invalidConfig);

			const outDir = join(tmpDir, "out");
			await expect(
				generatePolicies(configPath, outDir, ["markdown"]),
			).rejects.toThrow(/[Vv]alidation error/);
		} finally {
			await rm(tmpDir, { recursive: true });
		}
	});

	test("generates both privacy and terms policies via configs array", async () => {
		const tmpDir = await mkdtemp(join(tmpdir(), "openpolicy-vite-multi-"));
		try {
			const privacyConfigPath = join(tmpDir, "policy.config.ts");
			await Bun.write(privacyConfigPath, validConfig);

			const termsConfig = `
export default {
  effectiveDate: "2026-01-01",
  company: {
    name: "Test Co",
    legalName: "Test Co, Inc.",
    address: "1 Test Ave, Testville, TX 12345",
    contact: "legal@test.com",
  },
  acceptance: { methods: ["using the service"] },
  eligibility: { minimumAge: 13 },
  accounts: { registrationRequired: false, userResponsibleForCredentials: true, companyCanTerminate: true },
  prohibitedUses: ["Violating laws"],
  intellectualProperty: { companyOwnsService: true, usersMayNotCopy: true },
  termination: { companyCanTerminate: true, userCanTerminate: true },
  disclaimers: { serviceProvidedAsIs: true, noWarranties: true },
  limitationOfLiability: { excludesIndirectDamages: true },
  governingLaw: { jurisdiction: "Delaware, USA" },
  changesPolicy: { noticeMethod: "email", noticePeriodDays: 30 },
};
`;
			const termsConfigPath = join(tmpDir, "terms.config.ts");
			await Bun.write(termsConfigPath, termsConfig);

			const outDir = join(tmpDir, "out");
			await generatePolicies(
				privacyConfigPath,
				outDir,
				["markdown"],
				"privacy",
			);
			await generatePolicies(termsConfigPath, outDir, ["markdown"], "terms");

			expect(existsSync(join(outDir, "privacy-policy.md"))).toBe(true);
			expect(existsSync(join(outDir, "terms-of-service.md"))).toBe(true);
		} finally {
			await rm(tmpDir, { recursive: true });
		}
	});

	test("creates outDir if it does not exist", async () => {
		const tmpDir = await mkdtemp(join(tmpdir(), "openpolicy-vite-mkdir-"));
		try {
			const configPath = join(tmpDir, "policy.config.ts");
			await Bun.write(configPath, validConfig);

			const outDir = join(tmpDir, "deeply", "nested", "out");
			await generatePolicies(configPath, outDir, ["markdown"]);

			expect(existsSync(join(outDir, "privacy-policy.md"))).toBe(true);
		} finally {
			await rm(tmpDir, { recursive: true });
		}
	});
});
