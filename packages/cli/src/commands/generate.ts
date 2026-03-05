import { join } from "node:path";
import type {
	OutputFormat,
	PrivacyPolicyConfig,
	TermsOfServiceConfig,
} from "@openpolicy/core";
import { compilePolicy } from "@openpolicy/core";
import { defineCommand } from "citty";
import consola from "consola";
import { detectType } from "../utils/detect-type";
import { loadConfig } from "../utils/load-config";

export const generateCommand = defineCommand({
	meta: {
		name: "generate",
		description: "Compile a policy config to one or more output formats",
	},
	args: {
		config: {
			type: "positional",
			description: "Path to policy config file",
			default: "./policy.config.ts",
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
				'Policy type: "privacy" or "terms" (auto-detected from filename if omitted)',
			default: "",
		},
	},
	async run({ args }) {
		const formats = (args.format ?? "markdown")
			.split(",")
			.map((f) => f.trim())
			.filter(Boolean) as OutputFormat[];

		const outDir = args.out ?? "./output";
		const configPath = args.config ?? "./policy.config.ts";
		const policyType = detectType(args.type || undefined, configPath);

		consola.start(
			`Generating ${policyType} policy from ${configPath} → formats: ${formats.join(", ")}`,
		);

		const config = await loadConfig(configPath);

		const outputFilename =
			policyType === "terms" ? "terms-of-service" : "privacy-policy";

		const results = compilePolicy(
			policyType === "terms"
				? { type: "terms", ...(config as TermsOfServiceConfig) }
				: { type: "privacy", ...(config as PrivacyPolicyConfig) },
			{ formats },
		);

		for (const result of results) {
			const ext = result.format === "markdown" ? "md" : result.format;
			const outPath = join(outDir, `${outputFilename}.${ext}`);
			await Bun.write(outPath, result.content);
			consola.success(`Written: ${outPath}`);
		}

		consola.success(`Policy generation complete → ${outDir}`);
	},
});
