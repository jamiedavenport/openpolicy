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
import type { ComponentType, ReactNode } from "react";

export interface PolicyComponents {
	Section?: ComponentType<{ section: DocumentSection; children: ReactNode }>;
	Heading?: ComponentType<{ node: HeadingNode }>;
	Paragraph?: ComponentType<{ node: ParagraphNode; children: ReactNode }>;
	List?: ComponentType<{ node: ListNode; children: ReactNode }>;
	Text?: ComponentType<{ node: TextNode }>;
	Bold?: ComponentType<{ node: BoldNode }>;
	Italic?: ComponentType<{ node: ItalicNode }>;
	Link?: ComponentType<{ node: LinkNode }>;
}
