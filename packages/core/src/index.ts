export type { CookieConsent, CookieConsentStatus } from "./consent";
export { acceptAll, rejectAll } from "./consent";
export type {
	BoldNode,
	ContentNode,
	Document,
	DocumentSection,
	HeadingNode,
	InlineNode,
	ItalicNode,
	LinkNode,
	ListItemNode,
	ListNode,
	Node,
	NodeContext,
	ParagraphNode,
	PolicyType,
	TextNode,
} from "./documents";
export { bold, compile, heading, italic, li, link, ol, p, section, text, ul } from "./documents";
export { isJurisdiction, JURISDICTIONS } from "./jurisdictions";
export type {
	ChildrenConfig,
	CompanyConfig,
	CompileOptions,
	ConsentMechanism,
	CookiePolicyConfig,
	CookiePolicyCookies,
	DataCollection,
	EffectiveDate,
	Jurisdiction,
	LegalBasis,
	OpenPolicyConfig,
	OutputFormat,
	PolicyCategory,
	PolicyInput,
	PrivacyPolicyConfig,
	Retention,
	ThirdParty,
	TrackingTechnology,
	UserRight,
	ValidationIssue,
} from "./types";
export { isOpenPolicyConfig } from "./types";
export { deriveUserRights } from "./user-rights";
export { validatePrivacyPolicy } from "./validate";
export { validateOpenPolicyConfig } from "./validate-config";
export { validateCookiePolicy } from "./validate-cookie";

import type { CookiePolicyCookies, OpenPolicyConfig, PolicyCategory, PolicyInput } from "./types";
import { deriveUserRights } from "./user-rights";

const PRIVACY_FIELDS = ["dataCollected", "legalBasis", "retention", "children"] as const;

function hasAnyPrivacyField(config: OpenPolicyConfig): boolean {
	return PRIVACY_FIELDS.some((field) => config[field] !== undefined);
}

function hasCookieField(config: OpenPolicyConfig): boolean {
	return config.cookies !== undefined;
}

export function shouldEmit(category: PolicyCategory, config: OpenPolicyConfig): boolean {
	if (config.policies) return config.policies.includes(category);
	return category === "privacy" ? hasAnyPrivacyField(config) : hasCookieField(config);
}

const EMPTY_COOKIES: CookiePolicyCookies = { essential: true };

export function expandOpenPolicyConfig(config: OpenPolicyConfig): PolicyInput[] {
	const inputs: PolicyInput[] = [];
	if (shouldEmit("privacy", config)) {
		inputs.push({
			type: "privacy",
			company: config.company,
			effectiveDate: config.effectiveDate,
			jurisdictions: config.jurisdictions,
			dataCollected: config.dataCollected ?? {},
			legalBasis: config.legalBasis ?? [],
			retention: config.retention ?? {},
			cookies: config.cookies ?? EMPTY_COOKIES,
			thirdParties: config.thirdParties ?? [],
			userRights: deriveUserRights(config.jurisdictions),
			children: config.children,
		});
	}
	if (shouldEmit("cookie", config)) {
		inputs.push({
			type: "cookie",
			company: config.company,
			effectiveDate: config.effectiveDate,
			jurisdictions: config.jurisdictions,
			cookies: config.cookies ?? EMPTY_COOKIES,
			thirdParties: config.thirdParties ?? [],
			trackingTechnologies: config.trackingTechnologies,
			consentMechanism: config.consentMechanism,
		});
	}
	return inputs;
}
