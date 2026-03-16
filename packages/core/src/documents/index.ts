import type { PolicyInput } from "../types";
import { compilePrivacyDocument } from "./privacy";
import type { Document } from "./types";

export function compile(input: PolicyInput): Document {
	if (input.type === "privacy") {
		const { type: _, ...config } = input;
		return { type: "privacy", sections: compilePrivacyDocument(config) };
	}
	return {
		type: input.type,
		sections: [], // TODO: migrate terms + cookie builders
	};
}

export { bold, li, link, p, text, ul } from "./helpers";
export type {
	BoldNode,
	ContentNode,
	Document,
	DocumentSection,
	InlineNode,
	LinkNode,
	ListItemNode,
	ListNode,
	ParagraphNode,
	TextNode,
} from "./types";
