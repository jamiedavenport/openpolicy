import type { PolicyInput } from "../types";
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
	return {
		type: "document",
		policyType: input.type,
		sections: [], // TODO: migrate terms + cookie builders
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
