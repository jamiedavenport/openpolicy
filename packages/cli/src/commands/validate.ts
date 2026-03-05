import type {
	PrivacyPolicyConfig,
	TermsOfServiceConfig,
} from "@openpolicy/core";
import {
	validatePrivacyPolicy,
	validateTermsOfService,
} from "@openpolicy/core";
import { defineCommand } from "citty";
import consola from "consola";
import { detectType } from "../utils/detect-type";
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
		type: {
			type: "string",
			description:
				'Policy type: "privacy" or "terms" (auto-detected from filename if omitted)',
			default: "",
		},
	},
	async run({ args }) {
		const configPath = args.config ?? "./policy.config.ts";
		const policyType = detectType(args.type || undefined, configPath);

		consola.start(`Validating ${policyType} policy: ${configPath}`);

		const config = await loadConfig(configPath);
		const issues =
			policyType === "terms"
				? validateTermsOfService(config as TermsOfServiceConfig)
				: validatePrivacyPolicy(config as PrivacyPolicyConfig);

		if (issues.length === 0) {
			consola.success("Config is valid — no issues found.");
			return;
		}

		for (const issue of issues) {
			if (issue.level === "error") {
				consola.error(issue.message);
			} else {
				consola.warn(issue.message);
			}
		}

		const errors = issues.filter((i) => i.level === "error");
		if (errors.length > 0) {
			consola.fail(`Validation failed with ${errors.length} error(s).`);
			process.exit(1);
		}

		consola.success("Validation passed with warnings.");
	},
});
