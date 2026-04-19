import type { CookiePolicyConfig } from "@openpolicy/core";
import {
	expandOpenPolicyConfig,
	isOpenPolicyConfig,
	validateCookiePolicy,
	validatePrivacyPolicy,
} from "@openpolicy/core";
import { defineCommand } from "citty";
import consola from "consola";
import { loadConfig } from "../utils/load-config";

export const validateCommand = defineCommand({
	meta: {
		name: "validate",
		description: "Validate a policy config for compliance",
	},
	args: {
		config: {
			type: "positional",
			description: "Path to policy config file",
			default: "./policy.config.ts",
		},
		jurisdiction: {
			type: "string",
			description: "Jurisdiction to validate against: gdpr, ccpa, or all",
			default: "all",
		},
	},
	async run({ args }) {
		const configPath = args.config ?? "./policy.config.ts";

		const config = await loadConfig(configPath);

		if (!isOpenPolicyConfig(config)) {
			throw new Error(
				`[openpolicy] Config must use defineConfig() (OpenPolicyConfig): ${configPath}`,
			);
		}

		const inputs = expandOpenPolicyConfig(config);
		let totalErrors = 0;

		for (const input of inputs) {
			consola.start(`Validating ${input.type} policy: ${configPath}`);

			const issues =
				input.type === "cookie"
					? validateCookiePolicy(input as CookiePolicyConfig)
					: validatePrivacyPolicy(input);

			if (issues.length === 0) {
				consola.success(`${input.type}: no issues found.`);
				continue;
			}

			for (const issue of issues) {
				if (issue.level === "error") {
					consola.error(issue.message);
				} else {
					consola.warn(issue.message);
				}
			}

			const errors = issues.filter((i) => i.level === "error");
			totalErrors += errors.length;
			if (errors.length > 0) {
				consola.fail(
					`${input.type}: validation failed with ${errors.length} error(s).`,
				);
			} else {
				consola.success(`${input.type}: validation passed with warnings.`);
			}
		}

		if (totalErrors > 0) {
			process.exit(1);
		}
	},
});
