export type OutputFormat = "markdown" | "html" | "pdf";

export type CompileOptions = { formats: OutputFormat[] };

export type Jurisdiction = "us" | "eu" | "ca" | "au" | "nz" | "other";

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
	legalBasis: string;
	retention: Record<string, string>;
	cookies: { essential: boolean; analytics: boolean; marketing: boolean };
	thirdParties: { name: string; purpose: string }[];
	userRights: string[];
	jurisdictions: Jurisdiction[];
	// optional children-specific policy
	children?: {
		underAge: number;
		noticeUrl?: string;
	};
};

export type DisputeResolutionMethod =
	| "arbitration"
	| "litigation"
	| "mediation";

export type TermsOfServiceConfig = {
	effectiveDate: string;
	company: CompanyConfig;
	acceptance: { methods: string[] };
	eligibility?: { minimumAge: number; jurisdictionRestrictions?: string[] };
	accounts?: {
		registrationRequired: boolean;
		userResponsibleForCredentials: boolean;
		companyCanTerminate: boolean;
	};
	prohibitedUses?: string[];
	userContent?: {
		usersOwnContent: boolean;
		licenseGrantedToCompany: boolean;
		licenseDescription?: string;
		companyCanRemoveContent: boolean;
	};
	intellectualProperty?: {
		companyOwnsService: boolean;
		usersMayNotCopy: boolean;
	};
	payments?: {
		hasPaidFeatures: boolean;
		refundPolicy?: string;
		priceChangesNotice?: string;
	};
	availability?: { noUptimeGuarantee: boolean; maintenanceWindows?: string };
	termination?: {
		companyCanTerminate: boolean;
		userCanTerminate: boolean;
		effectOfTermination?: string;
	};
	disclaimers?: { serviceProvidedAsIs: boolean; noWarranties: boolean };
	limitationOfLiability?: {
		excludesIndirectDamages: boolean;
		liabilityCap?: string;
	};
	indemnification?: { userIndemnifiesCompany: boolean; scope?: string };
	thirdPartyServices?: { name: string; purpose: string }[];
	disputeResolution?: {
		method: DisputeResolutionMethod;
		venue?: string;
		classActionWaiver?: boolean;
	};
	governingLaw: { jurisdiction: string };
	changesPolicy?: { noticeMethod: string; noticePeriodDays?: number };
	privacyPolicyUrl?: string;
};

export type CookiePolicyConfig = {
	effectiveDate: string;
	company: CompanyConfig;
	cookies: {
		essential: boolean;
		analytics: boolean;
		functional: boolean;
		marketing: boolean;
	};
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
	| ({ type: "terms" } & TermsOfServiceConfig)
	| ({ type: "cookie" } & CookiePolicyConfig);

export type OpenPolicyConfig = {
	company: CompanyConfig;
	privacy?: Omit<PrivacyPolicyConfig, "company">;
	terms?: Omit<TermsOfServiceConfig, "company">;
	cookie?: Omit<CookiePolicyConfig, "company">;
};

export function isOpenPolicyConfig(value: unknown): value is OpenPolicyConfig {
	if (value === null || typeof value !== "object") return false;
	const obj = value as Record<string, unknown>;
	return (
		"company" in obj &&
		!("effectiveDate" in obj) &&
		("privacy" in obj || "terms" in obj || "cookie" in obj)
	);
}

export type ValidationIssue = {
	level: "error" | "warning";
	message: string;
};
