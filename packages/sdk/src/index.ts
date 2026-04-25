import type { LegalBasis, OpenPolicyConfig } from "@openpolicy/core";
import type { ScannedCollectionKeys, ScannedCookieKeys } from "./auto-collected";

export type {
	AutomatedDecision,
	AutomatedDecisionMaking,
	ChildrenConfig,
	CompanyConfig,
	ConsentMechanism,
	CookiePolicyCookies,
	CookieUsage,
	DataCollection,
	DataConfig,
	Dpo,
	EffectiveDate,
	EuRepresentative,
	Jurisdiction,
	LegalBasis,
	LegalBasisMap,
	OpenPolicyConfig,
	PolicyCategory,
	Purposes,
	Retention as RetentionMap,
	ThirdParty,
	TrackingTechnology,
} from "@openpolicy/core";

export {
	cookies,
	dataCollected,
	type ScannedCollectionKeys,
	type ScannedCookieKeys,
	thirdParties,
} from "./auto-collected";
export { collecting, Ignore } from "./collecting";
export { Compliance } from "./compliance";
export { DataCategories, LegalBases, Retention } from "./data";
export { defineCookie } from "./define-cookie";
export { Providers } from "./providers";
export { thirdParty } from "./third-parties";

type ScannedDataKey = keyof ScannedCollectionKeys & string;
type ScannedCookieKey = keyof ScannedCookieKeys & string;

type DataKey<Collected> = Extract<keyof Collected, string> | ScannedDataKey;
type CookieKey<Used> = Extract<keyof Used, string> | ScannedCookieKey;

type OpenPolicyConfigWithGenerics<
	Collected extends Record<string, string[]>,
	CookieUsed extends { essential: true; [k: string]: boolean },
> = Omit<OpenPolicyConfig, "data" | "cookies"> & {
	data?: {
		collected: Collected;
		purposes: { [P in DataKey<Collected>]: string };
		lawfulBasis: { [P in DataKey<Collected>]: LegalBasis };
		retention: { [P in DataKey<Collected>]: string };
	};
	cookies?: {
		used: CookieUsed;
		lawfulBasis: { [P in CookieKey<CookieUsed>]: LegalBasis };
	};
};

export function defineConfig<
	Collected extends Record<string, string[]> = Record<string, string[]>,
	CookieUsed extends { essential: true; [k: string]: boolean } = {
		essential: true;
		[k: string]: boolean;
	},
>(config: OpenPolicyConfigWithGenerics<Collected, CookieUsed>): OpenPolicyConfig {
	return config as OpenPolicyConfig;
}
