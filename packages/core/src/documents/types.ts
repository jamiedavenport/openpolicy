// Inline nodes
export type TextNode = { type: "text"; value: string };
export type BoldNode = { type: "bold"; value: string };
export type LinkNode = { type: "link"; href: string; value: string };
export type InlineNode = TextNode | BoldNode | LinkNode;

// Block nodes
export type ParagraphNode = { type: "paragraph"; children: InlineNode[] };
export type ListItemNode = {
	type: "listItem";
	children: InlineNode[];
	nested?: ListNode;
};
export type ListNode = { type: "list"; items: ListItemNode[] };
export type ContentNode = ParagraphNode | ListNode;

// A single section of a document
export type DocumentSection = {
	id: string;
	title: string;
	content: ContentNode[];
};

// The top-level document
export type Document = {
	type: "privacy" | "terms" | "cookie";
	sections: DocumentSection[];
};
