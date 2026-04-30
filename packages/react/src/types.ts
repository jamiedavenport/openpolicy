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
import type { ComponentType, ReactNode } from "react";

export interface PolicyComponents {
	Section?: ComponentType<{ section: DocumentSection; children: ReactNode }>;
	Heading?: ComponentType<{ node: HeadingNode }>;
	Paragraph?: ComponentType<{ node: ParagraphNode; children: ReactNode }>;
	List?: ComponentType<{ node: ListNode; children: ReactNode }>;
	Table?: ComponentType<{ node: TableNode; children: ReactNode }>;
	TableHeader?: ComponentType<{ children: ReactNode }>;
	TableBody?: ComponentType<{ children: ReactNode }>;
	TableRow?: ComponentType<{ node: TableRowNode; children: ReactNode }>;
	TableHead?: ComponentType<{ node: TableCellNode; children: ReactNode }>;
	TableCell?: ComponentType<{ node: TableCellNode; children: ReactNode }>;
	Text?: ComponentType<{ node: TextNode }>;
	Bold?: ComponentType<{ node: BoldNode }>;
	Italic?: ComponentType<{ node: ItalicNode }>;
	Link?: ComponentType<{ node: LinkNode }>;
}
