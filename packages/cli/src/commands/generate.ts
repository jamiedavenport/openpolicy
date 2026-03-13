import { existsSync, watch } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type {
	CookiePolicyConfig,
	OpenPolicyConfig,
	OutputFormat,
	PolicyInput,
	PrivacyPolicyConfig,
	TermsOfServiceConfig,
} from "@openpolicy/core";
import {
	compilePolicy,
	expandOpenPolicyConfig,
	isOpenPolicyConfig,
} from "@openpolicy/core";
import { defineCommand } from "citty";
import consola from "consola";
import { detectType } from "../utils/detect-type";
import { loadConfig } from "../utils/load-config";

function toPolicyInput(
	policyType: "privacy" | "terms" | "cookie",
	config: unknown,
): PolicyInput {
	if (policyType === "terms") {
		return { type: "terms", ...(config as TermsOfServiceConfig) };
	}
	if (policyType === "cookie") {
		return { type: "cookie", ...(config as CookiePolicyConfig) };
	}
	return { type: "privacy", ...(config as PrivacyPolicyConfig) };
}

async function generateFromConfig(
	configPath: string,
	formats: OutputFormat[],
	outDir: string,
	explicitType: string | undefined,
	bustCache = false,
): Promise<boolean> {
	if (!existsSync(configPath)) {
		return false;
	}

	const config = await loadConfig(configPath, bustCache);

	if (isOpenPolicyConfig(config)) {
		const inputs = expandOpenPolicyConfig(config as OpenPolicyConfig);
		if (inputs.length === 0) {
			consola.warn(
				`Unified config has no privacy or terms sections: ${configPath}`,
			);
			return true;
		}
		await mkdir(outDir, { recursive: true });
		for (const input of inputs) {
			const outputFilename =
				input.type === "terms"
					? "terms-of-service"
					: input.type === "cookie"
						? "cookie-policy"
						: "privacy-policy";
			consola.start(
				`Generating ${input.type} policy from ${configPath} → formats: ${formats.join(", ")}`,
			);
			const results = compilePolicy(input, { formats });
			for (const result of results) {
				const ext = result.format === "markdown" ? "md" : result.format;
				const outPath = join(outDir, `${outputFilename}.${ext}`);
				await writeFile(outPath, result.content, "utf-8");
				consola.success(`Written: ${outPath}`);
			}
		}
		return true;
	}

	const policyType = detectType(explicitType, configPath);

	consola.start(
		`Generating ${policyType} policy from ${configPath} → formats: ${formats.join(", ")}`,
	);

	const outputFilename =
		policyType === "terms"
			? "terms-of-service"
			: policyType === "cookie"
				? "cookie-policy"
				: "privacy-policy";

	const results = compilePolicy(toPolicyInput(policyType, config), {
		formats,
	});

	await mkdir(outDir, { recursive: true });
	for (const result of results) {
		const ext = result.format === "markdown" ? "md" : result.format;
		const outPath = join(outDir, `${outputFilename}.${ext}`);
		await writeFile(outPath, result.content, "utf-8");
		consola.success(`Written: ${outPath}`);
	}

	return true;
}

export const generateCommand = defineCommand({
	meta: {
		name: "generate",
		description: "Compile a policy config to one or more output formats",
	},
	args: {
		config: {
			type: "positional",
			description: "Path(s) to policy config file(s), comma-separated",
			default: "./openpolicy.ts,./policy.config.ts,./terms.config.ts",
		},
		format: {
			type: "string",
			description: "Comma-separated output formats: markdown,pdf,jsx",
			default: "markdown",
		},
		out: {
			type: "string",
			description: "Output directory",
			default: "./output",
		},
		type: {
			type: "string",
			description:
				'Policy type: "privacy", "terms", or "cookie" (auto-detected from filename if omitted)',
			default: "",
		},
		watch: {
			type: "boolean",
			description: "Watch config files and regenerate on changes",
			default: false,
		},
	},
	async run({ args }) {
		const formats = args.format
			.split(",")
			.map((f) => f.trim())
			.filter(Boolean) as OutputFormat[];
		const outDir = args.out;
		const explicitType = args.type || undefined;
		const configPaths = args.config
			.split(",")
			.map((p) => p.trim())
			.filter(Boolean);

		const hasMultipleConfigs = configPaths.length > 1;
		const watchablePaths: string[] = [];

		for (const configPath of configPaths) {
			const generated = await generateFromConfig(
				configPath,
				formats,
				outDir,
				explicitType,
			);

			if (generated) {
				watchablePaths.push(configPath);
			} else if (hasMultipleConfigs) {
				consola.warn(`Config not found, skipping: ${configPath}`);
			} else {
				throw new Error(`Config not found: ${configPath}`);
			}
		}

		consola.success(`Policy generation complete → ${outDir}`);

		if (args.watch && watchablePaths.length > 0) {
			consola.info("Watching for changes...");

			for (const configPath of watchablePaths) {
				let debounceTimer: ReturnType<typeof setTimeout> | null = null;

				watch(configPath, () => {
					if (debounceTimer) clearTimeout(debounceTimer);
					debounceTimer = setTimeout(async () => {
						try {
							await generateFromConfig(
								configPath,
								formats,
								outDir,
								explicitType,
								true,
							);
						} catch (err) {
							consola.error(`Error regenerating ${configPath}:`, err);
						}
					}, 100);
				});
			}
		}
	},
});
