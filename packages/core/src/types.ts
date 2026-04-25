export type OutputFormat = "markdown" | "html" | "pdf";

export type CompileOptions = { formats: OutputFormat[] };

export type PolicyCategory = "privacy" | "cookie";

export type Jurisdiction =
	| "eu" //    European Union — GDPR
	| "uk" //    United Kingdom — UK-GDPR + Data Protection Act 2018
	| "us-ca" // California, USA — CCPA / CPRA
	| "us-va" // Virginia, USA — VCDPA (reserved; no gated content in 0.1.0)
	| "us-co" // Colorado, USA — CPA (reserved; no gated content in 0.1.0)
	| "br" //    Brazil — LGPD (reserved; no gated content in 0.1.0)
	| "ca" //    Canada — PIPEDA (reserved; no gated content in 0.1.0)
	| "au" //    Australia — Privacy Act 1988 (reserved; no gated content in 0.1.0)
	| "jp" //    Japan — APPI (reserved; no gated content in 0.1.0)
	| "sg"; //   Singapore — PDPA (reserved; no gated content in 0.1.0)

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

// GDPR Art. 13(1)(c) requires the lawful basis to be stated for each
// distinct processing purpose — keys are human-readable purpose names,
// values are the Article 6 basis that applies to that purpose.
export type LegalBasisMap = Record<string, LegalBasis>;

// GDPR Art. 13(2)(f) requires disclosing each automated-decision-making
// or profiling activity (Art. 22) — the existence, the logic involved,
// and the significance and envisaged consequences for the data subject.
export type AutomatedDecision = {
	name: string;
	logic: string;
	significance: string;
};

export type AutomatedDecisionMaking = AutomatedDecision[];

export type Dpo =
	| { email: string; name?: string; phone?: string; address?: string }
	| { required: false; reason?: string };

export type CompanyConfig = {
	name: string;
	legalName: string;
	address: string;
	contact: string;
	dpo?: Dpo;
};

export type EffectiveDate = `${number}-${number}-${number}`;

export type DataCollection = Record<string, string[]>;

export type Purposes = Record<string, string>;

export type DataConfig = {
	collected: DataCollection;
	purposes: Purposes;
};

export type Retention = Record<string, string>;

export type ThirdParty = { name: string; purpose: string; policyUrl?: string };

export type ChildrenConfig = {
	underAge: number;
	noticeUrl?: string;
};

export type CookiePolicyCookies = {
	essential: boolean;
	[key: string]: boolean;
};

export type TrackingTechnology = string;

export type ConsentMechanism = {
	hasBanner: boolean;
	hasPreferencePanel: boolean;
	canWithdraw: boolean;
};

// Internal type consumed by section builders via PolicyInput.
// Produced by expandOpenPolicyConfig() — not part of the public API.
export type PrivacyPolicyConfig = {
	effectiveDate: EffectiveDate;
	company: CompanyConfig;
	data: DataConfig;
	legalBasis: LegalBasisMap;
	retention: Retention;
	cookies: CookiePolicyCookies;
	thirdParties: ThirdParty[];
	userRights: UserRight[];
	jurisdictions: Jurisdiction[];
	children?: ChildrenConfig;
	automatedDecisionMaking?: AutomatedDecisionMaking;
};

// Internal type consumed by section builders via PolicyInput.
// Produced by expandOpenPolicyConfig() — not part of the public API.
export type CookiePolicyConfig = {
	effectiveDate: EffectiveDate;
	company: CompanyConfig;
	cookies: CookiePolicyCookies;
	thirdParties: ThirdParty[];
	trackingTechnologies?: TrackingTechnology[];
	consentMechanism?: ConsentMechanism;
	jurisdictions: Jurisdiction[];
};

export type PolicyInput =
	| ({ type: "privacy" } & PrivacyPolicyConfig)
	| ({ type: "cookie" } & CookiePolicyConfig);

// Public config passed to defineConfig(). All fields live at the top level.
export type OpenPolicyConfig = {
	company: CompanyConfig;
	effectiveDate: EffectiveDate;
	jurisdictions: Jurisdiction[];

	// Data handling — feeds the privacy policy.
	data?: DataConfig;
	legalBasis?: LegalBasisMap;
	retention?: Retention;
	children?: ChildrenConfig;
	thirdParties?: ThirdParty[];
	automatedDecisionMaking?: AutomatedDecisionMaking;

	// Cookie posture — feeds the cookie policy and the privacy cookie-overview section.
	cookies?: CookiePolicyCookies;
	trackingTechnologies?: TrackingTechnology[];
	consentMechanism?: ConsentMechanism;

	// Explicit opt-out. Omit to auto-detect based on which fields are present.
	policies?: PolicyCategory[];
};

export function isOpenPolicyConfig(value: unknown): value is OpenPolicyConfig {
	if (value === null || typeof value !== "object") return false;
	const obj = value as Record<string, unknown>;
	return "company" in obj && "effectiveDate" in obj && !("type" in obj);
}

export type ValidationIssue = {
	code: string;
	level: "error" | "warning";
	message: string;
};
