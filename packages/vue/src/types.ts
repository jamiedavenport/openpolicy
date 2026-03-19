import type {
	BoldNode,
	DocumentSection,
	HeadingNode,
	ItalicNode,
	LinkNode,
	ListNode,
	ParagraphNode,
	TextNode,
} from "@openpolicy/core";
import type { Component, VNodeChild } from "vue";

export type PolicyTheme = Partial<
	Record<
		| "--op-heading-color"
		| "--op-body-color"
		| "--op-section-gap"
		| "--op-font-family"
		| "--op-font-size-heading"
		| "--op-font-weight-heading"
		| "--op-font-size-body"
		| "--op-line-height"
		| "--op-link-color"
		| "--op-link-color-hover"
		| "--op-border-color"
		| "--op-border-radius",
		string
	>
>;

export interface PolicyComponents {
	Section?: Component<{ section: DocumentSection; children?: VNodeChild }>;
	Heading?: Component<{ node: HeadingNode }>;
	Paragraph?: Component<{ node: ParagraphNode; children?: VNodeChild }>;
	List?: Component<{ node: ListNode; children?: VNodeChild }>;
	Text?: Component<{ node: TextNode }>;
	Bold?: Component<{ node: BoldNode }>;
	Italic?: Component<{ node: ItalicNode }>;
	Link?: Component<{ node: LinkNode }>;
}
