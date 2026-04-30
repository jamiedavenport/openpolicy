import type {
	BoldNode,
	DocumentSection,
	HeadingNode,
	ItalicNode,
	LinkNode,
	ListNode,
	ParagraphNode,
	TableCellNode,
	TableNode,
	TableRowNode,
	TextNode,
} from "@openpolicy/core";
import type { Component, VNodeChild } from "vue";

export interface PolicyComponents {
	Section?: Component<{ section: DocumentSection; children?: VNodeChild }>;
	Heading?: Component<{ node: HeadingNode }>;
	Paragraph?: Component<{ node: ParagraphNode; children?: VNodeChild }>;
	List?: Component<{ node: ListNode; children?: VNodeChild }>;
	Table?: Component<{ node: TableNode; children?: VNodeChild }>;
	TableHeader?: Component<{ children?: VNodeChild }>;
	TableBody?: Component<{ children?: VNodeChild }>;
	TableRow?: Component<{ node: TableRowNode; children?: VNodeChild }>;
	TableHead?: Component<{ node: TableCellNode; children?: VNodeChild }>;
	TableCell?: Component<{ node: TableCellNode; children?: VNodeChild }>;
	Text?: Component<{ node: TextNode }>;
	Bold?: Component<{ node: BoldNode }>;
	Italic?: Component<{ node: ItalicNode }>;
	Link?: Component<{ node: LinkNode }>;
}
