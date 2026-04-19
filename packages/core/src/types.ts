export type OutputFormat = "markdown" | "html" | "pdf";

export type CompileOptions = { formats: OutputFormat[] };

export type Jurisdiction = "us" | "eu" | "ca" | "au" | "nz" | "other";

export type UserRight =
	| "access"
	| "rectification"
	| "erasure"
	| "portability"
	| "restriction"
	| "objection"
	| "opt_out_sale"
	| "non_discrimination";

export type LegalBasis =
	| "consent"
	| "contract"
	| "legal_obligation"
	| "vital_interests"
	| "public_task"
	| "legitimate_interests";

export type CompanyConfig = {
	name: string;
	legalName: string;
	address: string;
	contact: string;
};

export type PrivacyPolicyConfig = {
	effectiveDate: string;
	company: CompanyConfig;
	dataCollected: Record<string, string[]>;
	legalBasis: LegalBasis | LegalBasis[];
	retention: Record<string, string>;
	cookies: { essential: boolean; analytics: boolean; marketing: boolean };
	thirdParties: { name: string; purpose: string; policyUrl?: string }[];
	userRights: UserRight[];
	jurisdictions: Jurisdiction[];
	// optional children-specific policy
	children?: {
		underAge: number;
		noticeUrl?: string;
	};
};

export type CookiePolicyCookies = {
	essential: boolean;
	[key: string]: boolean;
};

export type CookiePolicyConfig = {
	effectiveDate: string;
	company: CompanyConfig;
	cookies: CookiePolicyCookies;
	thirdParties?: { name: string; purpose: string; policyUrl?: string }[];
	trackingTechnologies?: string[];
	consentMechanism?: {
		hasBanner: boolean;
		hasPreferencePanel: boolean;
		canWithdraw: boolean;
	};
	jurisdictions: Jurisdiction[];
};

export type PolicyInput =
	| ({ type: "privacy" } & PrivacyPolicyConfig)
	| ({ type: "cookie" } & CookiePolicyConfig);

export type OpenPolicyConfig = {
	company: CompanyConfig;
	privacy?: Omit<PrivacyPolicyConfig, "company">;
	cookie?: Omit<CookiePolicyConfig, "company">;
};

export function isOpenPolicyConfig(value: unknown): value is OpenPolicyConfig {
	if (value === null || typeof value !== "object") return false;
	const obj = value as Record<string, unknown>;
	return (
		"company" in obj &&
		!("effectiveDate" in obj) &&
		("privacy" in obj || "cookie" in obj)
	);
}

export type ValidationIssue = {
	level: "error" | "warning";
	message: string;
};
