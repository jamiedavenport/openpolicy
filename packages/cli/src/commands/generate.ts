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
	bustCache = false,
): Promise<void> {
	const config = await loadConfig(configPath, bustCache);

	if (isOpenPolicyConfig(config)) {
		const inputs = expandOpenPolicyConfig(config as OpenPolicyConfig);
		if (inputs.length === 0) {
			consola.warn(
				`Unified config has no privacy or terms sections: ${configPath}`,
			);
			return;
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
		return;
	}

	const policyType = detectType(undefined, configPath);

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
}

export const generateCommand = defineCommand({
	meta: {
		name: "generate",
		description: "Compile a policy config to one or more output formats",
	},
	args: {
		config: {
			type: "positional",
			description: "Path to policy config file",
			default: "./openpolicy.ts",
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
		watch: {
			type: "boolean",
			description: "Watch config file and regenerate on changes",
			default: false,
		},
	},
	async run({ args }) {
		const formats = args.format
			.split(",")
			.map((f) => f.trim())
			.filter(Boolean) as OutputFormat[];
		const outDir = args.out;
		const configPath = args.config;

		if (!existsSync(configPath)) {
			throw new Error(`Config not found: ${configPath}`);
		}

		await generateFromConfig(configPath, formats, outDir);

		consola.success(`Policy generation complete → ${outDir}`);

		if (args.watch) {
			consola.info("Watching for changes...");

			let debounceTimer: ReturnType<typeof setTimeout> | null = null;

			watch(configPath, () => {
				if (debounceTimer) clearTimeout(debounceTimer);
				debounceTimer = setTimeout(async () => {
					try {
						await generateFromConfig(configPath, formats, outDir, true);
					} catch (err) {
						consola.error(`Error regenerating ${configPath}:`, err);
					}
				}, 100);
			});
		}
	},
});
