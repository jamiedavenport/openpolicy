import type { CookiePolicyConfig, OpenPolicyConfig } from "@openpolicy/core";

export type {
	CookiePolicyConfig,
	OpenPolicyConfig,
	PrivacyPolicyConfig,
	TermsOfServiceConfig,
} from "@openpolicy/core";

export function defineConfig(config: OpenPolicyConfig): OpenPolicyConfig {
	return config;
}

export function defineCookiePolicy(
	config: CookiePolicyConfig,
): CookiePolicyConfig {
	return config;
}
