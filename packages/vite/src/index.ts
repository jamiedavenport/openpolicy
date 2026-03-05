import { access, mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import type {
	OutputFormat,
	PrivacyPolicyConfig,
	TermsOfServiceConfig,
} from "@openpolicy/core";
import {
	compilePolicy,
	validatePrivacyPolicy,
	validateTermsOfService,
} from "@openpolicy/core";
import type { Plugin } from "vite";

export type PolicyConfigEntry =
	| string
	| { config: string; type?: "privacy" | "terms" };

export interface OpenPolicyOptions {
	configs?: PolicyConfigEntry[];
	config?: string;
	formats?: OutputFormat[];
	outDir?: string;
	type?: "privacy" | "terms";
}

function detectType(filename: string): "privacy" | "terms" {
	return filename.includes("terms") ? "terms" : "privacy";
}

function normalizeEntries(
	options: OpenPolicyOptions,
): Array<{ configFile: string; type: "privacy" | "terms" }> {
	if (options.configs) {
		return options.configs.map((entry) => {
			if (typeof entry === "string") {
				return { configFile: entry, type: detectType(entry) };
			}
			return {
				configFile: entry.config,
				type: entry.type ?? detectType(entry.config),
			};
		});
	}
	const configFile =
		options.type === "terms" ? "terms.config.ts" : "privacy.config.ts";
	return [
		{
			configFile: options.config ?? configFile,
			type: options.type ?? "privacy",
		},
	];
}

const PRIVACY_SCAFFOLD_TEMPLATE = `import { definePrivacyPolicy } from "@openpolicy/sdk";

export default definePrivacyPolicy({
  effectiveDate: "${new Date().toISOString().slice(0, 10)}",
  company: {
    name: "Your Company",
    legalName: "Your Company, Inc.",
    address: "123 Main St, City, State, ZIP",
    contact: "privacy@yourcompany.com",
  },
  dataCollected: {
    "Personal Information": ["Full name", "Email address"],
  },
  legalBasis: "Legitimate interests and consent",
  retention: {
    "All personal data": "As long as necessary for the purposes described in this policy",
  },
  cookies: { essential: true, analytics: false, marketing: false },
  thirdParties: [],
  userRights: ["access", "erasure"],
  jurisdictions: ["us"],
});
`;

const TERMS_SCAFFOLD_TEMPLATE = `import { defineTermsOfService } from "@openpolicy/sdk";

export default defineTermsOfService({
  effectiveDate: "${new Date().toISOString().slice(0, 10)}",
  company: {
    name: "Your Company",
    legalName: "Your Company, Inc.",
    address: "123 Main St, City, State, ZIP",
    contact: "legal@yourcompany.com",
  },
  acceptance: {
    methods: ["using the service", "creating an account"],
  },
  eligibility: {
    minimumAge: 13,
  },
  accounts: {
    registrationRequired: false,
    userResponsibleForCredentials: true,
    companyCanTerminate: true,
  },
  prohibitedUses: [
    "Violating any applicable laws or regulations",
    "Infringing on intellectual property rights",
  ],
  intellectualProperty: {
    companyOwnsService: true,
    usersMayNotCopy: true,
  },
  termination: {
    companyCanTerminate: true,
    userCanTerminate: true,
  },
  disclaimers: {
    serviceProvidedAsIs: true,
    noWarranties: true,
  },
  limitationOfLiability: {
    excludesIndirectDamages: true,
  },
  governingLaw: {
    jurisdiction: "Delaware, USA",
  },
  changesPolicy: {
    noticeMethod: "email or prominent notice on our website",
    noticePeriodDays: 30,
  },
});
`;

export async function writeScaffold(
	configPath: string,
	type: "privacy" | "terms" = "privacy",
): Promise<void> {
	const template =
		type === "terms" ? TERMS_SCAFFOLD_TEMPLATE : PRIVACY_SCAFFOLD_TEMPLATE;
	await writeFile(configPath, template, "utf8");
}

export async function generatePolicies(
	configPath: string,
	outDir: string,
	formats: OutputFormat[],
	type: "privacy" | "terms" = "privacy",
): Promise<void> {
	const mod = await import(`${configPath}?t=${Date.now()}`);
	const config =
		(mod as Record<string, unknown>)["default"] ??
		(mod as Record<string, unknown>)["module.exports"] ??
		mod;

	if (config === null || config === undefined || typeof config !== "object") {
		throw new Error(
			`[openpolicy] Config must export a non-null object: ${configPath}`,
		);
	}

	const issues =
		type === "terms"
			? validateTermsOfService(config as TermsOfServiceConfig)
			: validatePrivacyPolicy(config as PrivacyPolicyConfig);

	for (const issue of issues) {
		if (issue.level === "error") {
			throw new Error(`[openpolicy] Validation error: ${issue.message}`);
		}
		console.warn(`[openpolicy] Warning: ${issue.message}`);
	}

	const results = compilePolicy(
		type === "terms"
			? { type: "terms", ...(config as TermsOfServiceConfig) }
			: { type: "privacy", ...(config as PrivacyPolicyConfig) },
		{ formats },
	);

	const outputFilename =
		type === "terms" ? "terms-of-service" : "privacy-policy";

	await mkdir(outDir, { recursive: true });

	for (const result of results) {
		const ext = result.format === "markdown" ? "md" : result.format;
		await writeFile(
			join(outDir, `${outputFilename}.${ext}`),
			result.content,
			"utf8",
		);
	}
}

export function openPolicy(options: OpenPolicyOptions = {}): Plugin {
	const formats: OutputFormat[] = options.formats ?? ["markdown"];
	let resolvedOutDir: string;
	let resolvedEntries: Array<{ configPath: string; type: "privacy" | "terms" }>;

	return {
		name: "openpolicy",

		configResolved(config) {
			resolvedOutDir = resolve(
				config.root,
				options.outDir ?? "public/policies",
			);
			resolvedEntries = normalizeEntries(options).map((e) => ({
				configPath: resolve(config.root, e.configFile),
				type: e.type,
			}));
		},

		async buildStart() {
			for (const entry of resolvedEntries) {
				const configExists = await access(entry.configPath).then(
					() => true,
					() => false,
				);
				if (!configExists) {
					await writeScaffold(entry.configPath, entry.type);
					console.log(`[openpolicy] Scaffolded config at ${entry.configPath}`);
					continue;
				}
				await generatePolicies(
					entry.configPath,
					resolvedOutDir,
					formats,
					entry.type,
				);
			}
		},

		configureServer(server) {
			for (const entry of resolvedEntries) {
				server.watcher.add(entry.configPath);
			}
			server.watcher.on("change", async (path) => {
				const entry = resolvedEntries.find((e) => e.configPath === path);
				if (!entry) return;
				try {
					await generatePolicies(
						entry.configPath,
						resolvedOutDir,
						formats,
						entry.type,
					);
					console.log("[openpolicy] Policies regenerated");
				} catch (err) {
					console.error("[openpolicy]", err);
				}
			});
		},
	};
}
