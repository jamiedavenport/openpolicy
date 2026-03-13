import type { OpenPolicyConfig } from "@openpolicy/core";

export type {
	CookiePolicyConfig,
	OpenPolicyConfig,
	PrivacyPolicyConfig,
	TermsOfServiceConfig,
} from "@openpolicy/core";

export function defineConfig(config: OpenPolicyConfig): OpenPolicyConfig {
	return config;
}
