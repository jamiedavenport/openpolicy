import type {
	BoldNode,
	ContentNode,
	DocumentSection,
	HeadingNode,
	InlineNode,
	LinkNode,
	ListItemNode,
	ListNode,
	NodeContext,
	ParagraphNode,
	TextNode,
} from "./types";

export const heading = (value: string, context?: NodeContext): HeadingNode => ({
	type: "heading",
	value,
	...(context && { context }),
});
export const text = (value: string, context?: NodeContext): TextNode => ({
	type: "text",
	value,
	...(context && { context }),
});
export const bold = (value: string, context?: NodeContext): BoldNode => ({
	type: "bold",
	value,
	...(context && { context }),
});
export const link = (
	href: string,
	value: string,
	context?: NodeContext,
): LinkNode => ({ type: "link", href, value, ...(context && { context }) });
export const p = (
	children: (string | InlineNode)[],
	context?: NodeContext,
): ParagraphNode => ({
	type: "paragraph",
	children: children.map((c) => (typeof c === "string" ? text(c) : c)),
	...(context && { context }),
});
export const li = (
	children: (string | InlineNode | ListNode)[],
	context?: NodeContext,
): ListItemNode => ({
	type: "listItem",
	children: children.map((c) => (typeof c === "string" ? text(c) : c)),
	...(context && { context }),
});
export const ul = (items: ListItemNode[], context?: NodeContext): ListNode => ({
	type: "list",
	items,
	...(context && { context }),
});
export const section = (
	id: string,
	content: ContentNode[],
	context?: NodeContext,
): DocumentSection => ({
	type: "section",
	id,
	content,
	...(context && { context }),
});
