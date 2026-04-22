import type { OpenPolicyConfig } from "@openpolicy/core";

export type {
	ChildrenConfig,
	CompanyConfig,
	ConsentMechanism,
	CookiePolicyCookies,
	DataCollection,
	EffectiveDate,
	Jurisdiction,
	LegalBasis,
	OpenPolicyConfig,
	PolicyCategory,
	Retention as RetentionMap,
	ThirdParty,
	TrackingTechnology,
} from "@openpolicy/core";

export { cookies, dataCollected, thirdParties } from "./auto-collected";
export { collecting, Ignore } from "./collecting";
export { Compliance } from "./compliance";
export { DataCategories, LegalBases, Retention } from "./data";
export { defineCookie } from "./define-cookie";
export { Providers } from "./providers";
export { thirdParty } from "./third-parties";

export function defineConfig(config: OpenPolicyConfig): OpenPolicyConfig {
	return config;
}
