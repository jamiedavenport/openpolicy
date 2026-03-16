import type {
	BoldNode,
	InlineNode,
	LinkNode,
	ListItemNode,
	ListNode,
	ParagraphNode,
	TextNode,
} from "./types";

export const text = (value: string): TextNode => ({ type: "text", value });
export const bold = (value: string): BoldNode => ({ type: "bold", value });
export const link = (href: string, value: string): LinkNode => ({
	type: "link",
	href,
	value,
});
export const p = (...children: (string | InlineNode)[]): ParagraphNode => ({
	type: "paragraph",
	children: children.map((c) => (typeof c === "string" ? text(c) : c)),
});
export const li = (
	children: (string | InlineNode)[],
	nested?: ListNode,
): ListItemNode => ({
	type: "listItem",
	children: children.map((c) => (typeof c === "string" ? text(c) : c)),
	...(nested ? { nested } : {}),
});
export const ul = (...items: ListItemNode[]): ListNode => ({
	type: "list",
	items,
});
