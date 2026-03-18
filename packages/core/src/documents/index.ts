import type { PolicyInput } from "../types";
import { compileCookieDocument } from "./cookie";
import { compilePrivacyDocument } from "./privacy";
import { compileTermsDocument } from "./terms";
import type { Document } from "./types";

export function compile(input: PolicyInput): Document {
	if (input.type === "privacy") {
		const { type: _, ...config } = input;
		return {
			type: "document",
			policyType: "privacy",
			sections: compilePrivacyDocument(config),
		};
	}
	if (input.type === "terms") {
		const { type: _, ...config } = input;
		return {
			type: "document",
			policyType: "terms",
			sections: compileTermsDocument(config),
		};
	}
	const { type: _, ...config } = input;
	return {
		type: "document",
		policyType: "cookie",
		sections: compileCookieDocument(config),
	};
}

export { bold, heading, li, link, p, section, text, ul } from "./helpers";
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
} from "./types";
