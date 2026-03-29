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
export {
	bold,
	compile,
	heading,
	italic,
	li,
	link,
	ol,
	p,
	section,
	text,
	ul,
} from "./documents";
export type {
	CompanyConfig,
	CompileOptions,
	CookiePolicyConfig,
	DisputeResolutionMethod,
	Jurisdiction,
	OpenPolicyConfig,
	OutputFormat,
	PolicyInput,
	PrivacyPolicyConfig,
	TermsOfServiceConfig,
	ValidationIssue,
} from "./types";
export { isOpenPolicyConfig } from "./types";
export { validatePrivacyPolicy } from "./validate";
export { validateCookiePolicy } from "./validate-cookie";
export { validateTermsOfService } from "./validate-terms";

import type { OpenPolicyConfig, PolicyInput } from "./types";

export function expandOpenPolicyConfig(
	config: OpenPolicyConfig,
): PolicyInput[] {
	const inputs: PolicyInput[] = [];
	if (config.privacy) {
		inputs.push({
			type: "privacy",
			company: config.company,
			...config.privacy,
		});
	}
	if (config.terms) {
		inputs.push({ type: "terms", company: config.company, ...config.terms });
	}
	if (config.cookie) {
		inputs.push({ type: "cookie", company: config.company, ...config.cookie });
	}
	return inputs;
}
