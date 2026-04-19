import type { PolicyInput } from "../types";
import { compileCookieDocument } from "./cookie";
import { compilePrivacyDocument } from "./privacy";
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
	const { type: _, ...config } = input;
	return {
		type: "document",
		policyType: "cookie",
		sections: compileCookieDocument(config),
	};
}

export {
	bold,
	heading,
	italic,
	li,
	link,
	ol,
	p,
	section,
	text,
	ul,
} from "./helpers";
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
} from "./types";
