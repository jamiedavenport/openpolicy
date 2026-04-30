export type NodeContext = {
	reason?: string;
};

// Inline nodes
export type TextNode = { type: "text"; value: string; context?: NodeContext };
export type BoldNode = { type: "bold"; value: string; context?: NodeContext };
export type ItalicNode = {
	type: "italic";
	value: string;
	context?: NodeContext;
};
export type LinkNode = {
	type: "link";
	href: string;
	value: string;
	context?: NodeContext;
};
export type InlineNode = TextNode | BoldNode | ItalicNode | LinkNode;

// Block nodes
export type HeadingNode = {
	type: "heading";
	level?: 1 | 2 | 3 | 4 | 5 | 6; // defaults to 2 if omitted
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
	ordered?: boolean; // defaults to false (unordered)
	items: ListItemNode[];
	context?: NodeContext;
};
export type TableCellNode = {
	type: "tableCell";
	children: InlineNode[];
	context?: NodeContext;
};
export type TableRowNode = {
	type: "tableRow";
	cells: TableCellNode[];
	context?: NodeContext;
};
export type TableNode = {
	type: "table";
	header: TableRowNode;
	rows: TableRowNode[];
	context?: NodeContext;
};
export type ContentNode = HeadingNode | ParagraphNode | ListNode | TableNode;

// A single section of a document
export type DocumentSection = {
	type: "section";
	id: string;
	content: ContentNode[];
	context?: NodeContext;
};

export type PolicyType = "privacy" | "cookie";

// The top-level document
export type Document = {
	type: "document";
	policyType: PolicyType;
	sections: DocumentSection[];
	context?: NodeContext;
};

// Every node in the document tree
export type Node =
	| Document
	| DocumentSection
	| ContentNode
	| ListItemNode
	| TableRowNode
	| TableCellNode
	| InlineNode;
