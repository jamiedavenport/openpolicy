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
	Jurisdiction,
	LegalBasis,
	OpenPolicyConfig,
	OutputFormat,
	PolicyInput,
	PrivacyPolicyConfig,
	UserRight,
	ValidationIssue,
} from "./types";
export { isOpenPolicyConfig } from "./types";
export { validatePrivacyPolicy } from "./validate";
export { validateCookiePolicy } from "./validate-cookie";

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
	if (config.cookie) {
		inputs.push({ type: "cookie", company: config.company, ...config.cookie });
	}
	return inputs;
}
