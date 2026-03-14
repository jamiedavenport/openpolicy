import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { generatePolicies, openPolicy } from "./index";

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
		expect(() => openPolicy({ configPath: "custom.config.ts" })).not.toThrow();
		expect(() => openPolicy({ outDir: "dist/policies" })).not.toThrow();
	});
});

const validConfig = `
export default {
  company: {
    name: "Test Co",
    legalName: "Test Co, Inc.",
    address: "1 Test Ave, Testville, TX 12345",
    contact: "privacy@test.com",
  },
  privacy: {
    effectiveDate: "2026-01-01",
    dataCollected: { "Usage Data": ["Page views", "Session duration"] },
    legalBasis: "Legitimate interests",
    retention: { "Usage Data": "90 days" },
    cookies: { essential: true, analytics: true, marketing: false },
    thirdParties: [],
    userRights: ["access", "erasure"],
    jurisdictions: ["us"],
  },
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

	test("throws on non-unified config", async () => {
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
			).rejects.toThrow(/Config must use defineConfig/);
		} finally {
			await rm(tmpDir, { recursive: true });
		}
	});

	test("generates both privacy-policy.md and terms-of-service.md from unified config", async () => {
		const tmpDir = await mkdtemp(join(tmpdir(), "openpolicy-vite-unified-"));
		try {
			const unifiedConfig = `
export default {
  company: {
    name: "Acme Inc.",
    legalName: "Acme Corporation",
    address: "123 Main St, Springfield, USA",
    contact: "privacy@acme.com",
  },
  privacy: {
    effectiveDate: "2026-01-01",
    dataCollected: { "Account Information": ["Name", "Email"] },
    legalBasis: "Legitimate interests",
    retention: { "Account data": "Until deletion" },
    cookies: { essential: true, analytics: false, marketing: false },
    thirdParties: [],
    userRights: ["access"],
    jurisdictions: ["us"],
  },
  terms: {
    effectiveDate: "2026-01-01",
    acceptance: { methods: ["using the service"] },
    governingLaw: { jurisdiction: "Delaware, USA" },
  },
};
`;
			const configPath = join(tmpDir, "openpolicy.ts");
			await Bun.write(configPath, unifiedConfig);

			const outDir = join(tmpDir, "out");
			await generatePolicies(configPath, outDir, ["markdown"]);

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
