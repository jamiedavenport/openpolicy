export type OutputFormat = "markdown" | "html" | "pdf" | "jsx";

export type CompileOptions = { formats: OutputFormat[] };

export type PolicySection = {
	id: string;
	title: string;
	body: string;
};

export type Jurisdiction = "us" | "eu" | "ca" | "au" | "nz" | "other";

export type PrivacyPolicyConfig = {
	effectiveDate: string;
	company: {
		name: string;
		legalName: string;
		address: string;
		contact: string;
	};
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
	company: {
		name: string;
		legalName: string;
		address: string;
		contact: string;
	};
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

export type PolicyInput =
	| ({ type: "privacy" } & PrivacyPolicyConfig)
	| ({ type: "terms" } & TermsOfServiceConfig);

export type ValidationIssue = {
	level: "error" | "warning";
	message: string;
};
