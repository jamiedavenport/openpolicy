import type {
	PrivacyPolicyConfig,
	TermsOfServiceConfig,
} from "@openpolicy/core";

export type {
	PrivacyPolicyConfig,
	TermsOfServiceConfig,
} from "@openpolicy/core";

export function definePrivacyPolicy(
	config: PrivacyPolicyConfig,
): PrivacyPolicyConfig {
	return config;
}

export function defineTermsOfService(
	config: TermsOfServiceConfig,
): TermsOfServiceConfig {
	return config;
}
