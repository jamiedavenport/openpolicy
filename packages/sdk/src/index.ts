import type { OpenPolicyConfig } from "@openpolicy/core";
import type { ScannedCollectionKeys } from "./auto-collected";

export type {
	ChildrenConfig,
	CompanyConfig,
	ConsentMechanism,
	CookiePolicyCookies,
	DataCollection,
	DataConfig,
	EffectiveDate,
	Jurisdiction,
	LegalBasis,
	OpenPolicyConfig,
	PolicyCategory,
	Purposes,
	Retention as RetentionMap,
	ThirdParty,
	TrackingTechnology,
} from "@openpolicy/core";

export { cookies, dataCollected, type ScannedCollectionKeys, thirdParties } from "./auto-collected";
export { collecting, Ignore } from "./collecting";
export { Compliance } from "./compliance";
export { DataCategories, LegalBases, Retention } from "./data";
export { defineCookie } from "./define-cookie";
export { Providers } from "./providers";
export { thirdParty } from "./third-parties";

type ScannedKey = keyof ScannedCollectionKeys & string;

type OpenPolicyConfigWithPurposes<Collected extends Record<string, string[]>> = Omit<
	OpenPolicyConfig,
	"data"
> & {
	data?: {
		collected: Collected;
		purposes: { [P in Extract<keyof Collected, string> | ScannedKey]: string };
	};
};

export function defineConfig<Collected extends Record<string, string[]> = Record<string, string[]>>(
	config: OpenPolicyConfigWithPurposes<Collected>,
): OpenPolicyConfig {
	return config as OpenPolicyConfig;
}
