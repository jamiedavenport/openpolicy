export type NodeContext = {
	reason?: string;
};

// Inline nodes
export type TextNode = { type: "text"; value: string; context?: NodeContext };
export type BoldNode = { type: "bold"; value: string; context?: NodeContext };
export type LinkNode = {
	type: "link";
	href: string;
	value: string;
	context?: NodeContext;
};
export type InlineNode = TextNode | BoldNode | LinkNode;

// Block nodes
export type HeadingNode = {
	type: "heading";
	value: string;
	context?: NodeContext;
};
export type ParagraphNode = {
	type: "paragraph";
	children: InlineNode[];
	context?: NodeContext;
};
export type ListItemNode = {
	type: "listItem";
	children: (InlineNode | ListNode)[];
	context?: NodeContext;
};
export type ListNode = {
	type: "list";
	items: ListItemNode[];
	context?: NodeContext;
};
export type ContentNode = HeadingNode | ParagraphNode | ListNode;

// A single section of a document
export type DocumentSection = {
	type: "section";
	id: string;
	content: ContentNode[];
	context?: NodeContext;
};

// The top-level document
export type Document = {
	type: "document";
	policyType: "privacy" | "terms" | "cookie";
	sections: DocumentSection[];
	context?: NodeContext;
};

// Every node in the document tree
export type Node =
	| Document
	| DocumentSection
	| HeadingNode
	| ContentNode
	| ListItemNode
	| InlineNode;
