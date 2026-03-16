import type {
	BoldNode,
	DocumentSection,
	LinkNode,
	ListNode,
	ParagraphNode,
	TextNode,
} from "@openpolicy/core";
import type { ComponentType, ReactNode } from "react";

export type PolicyTheme = Partial<
	Record<
		| "--op-heading-color"
		| "--op-body-color"
		| "--op-section-gap"
		| "--op-font-family"
		| "--op-font-size-heading"
		| "--op-font-size-body"
		| "--op-border-color"
		| "--op-border-radius",
		string
	>
>;

export interface PolicyComponents {
	Section?: ComponentType<{ section: DocumentSection; children: ReactNode }>;
	Heading?: ComponentType<{ id: string; children: ReactNode }>;
	Paragraph?: ComponentType<{ node: ParagraphNode }>;
	List?: ComponentType<{ node: ListNode }>;
	Text?: ComponentType<{ node: TextNode }>;
	Bold?: ComponentType<{ node: BoldNode }>;
	Link?: ComponentType<{ node: LinkNode }>;
}
