export type {
	BoldNode,
	ContentNode,
	Document,
	DocumentSection,
	HeadingNode,
	InlineNode,
	LinkNode,
	ListItemNode,
	ListNode,
	Node,
	NodeContext,
	ParagraphNode,
	TextNode,
} from "./documents";
export {
	bold,
	compile,
	heading,
	li,
	link,
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

import { compile } from "./documents";
import { renderHTML } from "./renderers/html";
import { renderMarkdown } from "./renderers/markdown";
import { renderPDF } from "./renderers/pdf";
import type {
	CompileOptions,
	OpenPolicyConfig,
	OutputFormat,
	PolicyInput,
} from "./types";

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

function filenameFor(type: PolicyInput["type"], ext: string): string {
	switch (type) {
		case "privacy":
			return `privacy-policy.${ext}`;
		case "terms":
			return `terms-of-service.${ext}`;
		case "cookie":
			return `cookie-policy.${ext}`;
	}
}

export async function compilePolicy(
	input: PolicyInput,
	options?: CompileOptions,
): Promise<
	{ format: OutputFormat; filename: string; content: string | Buffer }[]
> {
	const doc = compile(input);
	const formats = options?.formats ?? ["markdown"];
	return Promise.all(
		formats.map(async (format) => {
			switch (format) {
				case "markdown":
					return {
						format,
						filename: filenameFor(input.type, "md"),
						content: renderMarkdown(doc),
					};
				case "html":
					return {
						format,
						filename: filenameFor(input.type, "html"),
						content: renderHTML(doc),
					};
				case "pdf":
					return {
						format,
						filename: filenameFor(input.type, "pdf"),
						content: await renderPDF(doc),
					};
				case "jsx":
					throw new Error("jsx format is not yet implemented");
				default:
					throw new Error(`Format not yet implemented: ${format}`);
			}
		}),
	);
}
