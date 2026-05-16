import type {
	BoldNode,
	DocumentSection,
	HeadingNode,
	ItalicNode,
	LinkNode,
	ListItemNode,
	ListNode,
	ParagraphNode,
	TableCellNode,
	TableHeaderCellNode,
	TableHeaderRowNode,
	TableNode,
	TableRowNode,
	TextNode,
	Visitor,
} from "@openpolicy/core";

/**
 * Svelte renders from compiled templates, not a value-returning function, so it
 * consumes the shared core `visit()` indirectly: `planVisitor` is the single
 * walker that turns the frozen `Node` tree into a serializable `RenderPlan`
 * tree, and one small recursive `RenderNode.svelte` interprets that plan. This
 * replaces the two hand-rolled template walks (`RenderNode.svelte` +
 * `RenderTable.svelte`) with one `Visitor` map (PS-12 / ADR 0001).
 *
 * Each slot variant carries the precisely-typed node so the interpreter needs
 * no casts; the `Visitor` mapped type still forces every `Node` variant to be
 * handled.
 */
type SlotPlan =
	| { slot: "section"; node: DocumentSection }
	| { slot: "heading"; node: HeadingNode }
	| { slot: "paragraph"; node: ParagraphNode }
	| { slot: "list"; node: ListNode }
	| { slot: "listItem"; node: ListItemNode }
	| { slot: "table"; node: TableNode }
	| { slot: "tableHeader"; node: TableNode }
	| { slot: "tableBody"; node: TableNode }
	| { slot: "tableHeaderRow"; node: TableHeaderRowNode }
	| { slot: "tableRow"; node: TableRowNode }
	| { slot: "tableHead"; node: TableHeaderCellNode }
	| { slot: "tableCell"; node: TableCellNode }
	| { slot: "text"; node: TextNode }
	| { slot: "bold"; node: BoldNode }
	| { slot: "italic"; node: ItalicNode }
	| { slot: "link"; node: LinkNode };

export type RenderPlan =
	| ({ k: "slot"; children: RenderPlan[] } & SlotPlan)
	| { k: "frag"; children: RenderPlan[] }
	| { k: "none" };

export const planVisitor: Visitor<RenderPlan> = {
	document: (node, v) => ({ k: "frag", children: node.sections.map(v) }),
	section: (node, v) => ({ k: "slot", slot: "section", node, children: node.content.map(v) }),
	heading: (node) => ({ k: "slot", slot: "heading", node, children: [] }),
	paragraph: (node, v) => ({ k: "slot", slot: "paragraph", node, children: node.children.map(v) }),
	list: (node, v) => ({ k: "slot", slot: "list", node, children: node.items.map(v) }),
	listItem: (node, v) => ({ k: "slot", slot: "listItem", node, children: node.children.map(v) }),
	table: (node, v) => ({
		k: "slot",
		slot: "table",
		node,
		children: [
			{ k: "slot", slot: "tableHeader", node, children: [v(node.header)] },
			{ k: "slot", slot: "tableBody", node, children: node.rows.map(v) },
		],
	}),
	tableHeaderRow: (node, v) => ({
		k: "slot",
		slot: "tableHeaderRow",
		node,
		children: node.cells.map(v),
	}),
	tableRow: (node, v) => ({ k: "slot", slot: "tableRow", node, children: node.cells.map(v) }),
	tableHeaderCell: (node, v) => ({
		k: "slot",
		slot: "tableHead",
		node,
		children: node.children.map(v),
	}),
	tableCell: (node, v) => ({ k: "slot", slot: "tableCell", node, children: node.children.map(v) }),
	text: (node) => ({ k: "slot", slot: "text", node, children: [] }),
	bold: (node) => ({ k: "slot", slot: "bold", node, children: [] }),
	italic: (node) => ({ k: "slot", slot: "italic", node, children: [] }),
	link: (node) => ({ k: "slot", slot: "link", node, children: [] }),
	// Forward-compat: an unrecognized future node degrades to a no-op (ADR 0001).
	unknown: () => ({ k: "none" }),
};
