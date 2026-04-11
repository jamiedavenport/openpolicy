import type { OpenPolicyConfig } from "@openpolicy/core";

export type {
	CookiePolicyConfig,
	LegalBasis,
	OpenPolicyConfig,
	PrivacyPolicyConfig,
	TermsOfServiceConfig,
	UserRight,
} from "@openpolicy/core";

export { dataCollected } from "./auto-collected";
export { collecting } from "./collecting";
export { Compliance } from "./compliance";
export { DataCategories, LegalBases, Retention, Rights } from "./data";
export { Providers } from "./providers";

export function defineConfig(config: OpenPolicyConfig): OpenPolicyConfig {
	return config;
}
