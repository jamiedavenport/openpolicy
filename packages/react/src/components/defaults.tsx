import type {
	BoldNode,
	DocumentSection,
	HeadingNode,
	ItalicNode,
	LinkNode,
	ListItemNode,
	ListNode,
	Node,
	ParagraphNode,
	TableCellNode,
	TableHeaderCellNode,
	TableHeaderRowNode,
	TableNode,
	TableRowNode,
	TextNode,
	Visitor,
} from "@openpolicy/core";
import { visit } from "@openpolicy/core";
import { Fragment, type CSSProperties, type ReactNode } from "react";
import type { PolicyComponents } from "../types";

export function DefaultRoot({ children, style }: { children: ReactNode; style?: unknown }) {
	return (
		<div data-op-policy style={style as CSSProperties | undefined}>
			{children}
		</div>
	);
}

export function DefaultHeading({ node }: { node: HeadingNode }) {
	const level = node.level ?? 2;
	const Tag = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
	return <Tag data-op-heading>{node.value}</Tag>;
}

export function DefaultText({ node }: { node: TextNode }) {
	return <>{node.value}</>;
}

export function DefaultBold({ node }: { node: BoldNode }) {
	return <strong>{node.value}</strong>;
}

function DefaultItalic({ node }: { node: ItalicNode }) {
	return <em>{node.value}</em>;
}

export function DefaultLink({ node }: { node: LinkNode }) {
	return <a href={node.href}>{node.value}</a>;
}

export function DefaultSection({
	section,
	children,
}: {
	section: DocumentSection;
	children: ReactNode;
}) {
	return (
		<section
			data-op-section
			id={section.id}
			{...(section.context?.reason?.code && {
				"data-op-reason": section.context.reason.code,
			})}
		>
			{children}
		</section>
	);
}

export function DefaultParagraph({
	node: _node,
	children,
}: {
	node: ParagraphNode;
	children: ReactNode;
}) {
	return <p data-op-paragraph>{children}</p>;
}

export function DefaultList({ node, children }: { node: ListNode; children: ReactNode }) {
	const Tag = node.ordered ? "ol" : "ul";
	return <Tag data-op-list>{children}</Tag>;
}

export function DefaultListItem({
	node: _node,
	children,
}: {
	node: ListItemNode;
	children: ReactNode;
}) {
	return <li data-op-list-item>{children}</li>;
}

export function DefaultTable({ node: _node, children }: { node: TableNode; children: ReactNode }) {
	return <table data-op-table>{children}</table>;
}

export function DefaultTableHeader({ children }: { children: ReactNode }) {
	return <thead data-op-table-header>{children}</thead>;
}

export function DefaultTableBody({ children }: { children: ReactNode }) {
	return <tbody data-op-table-body>{children}</tbody>;
}

export function DefaultTableRow({
	node: _node,
	children,
}: {
	node: TableRowNode;
	children: ReactNode;
}) {
	return <tr data-op-table-row>{children}</tr>;
}

export function DefaultTableHeaderRow({
	node: _node,
	children,
}: {
	node: TableHeaderRowNode;
	children: ReactNode;
}) {
	return <tr data-op-table-row>{children}</tr>;
}

export function DefaultTableHead({
	node: _node,
	children,
}: {
	node: TableHeaderCellNode;
	children: ReactNode;
}) {
	return (
		<th data-op-table-cell scope="col">
			{children}
		</th>
	);
}

export function DefaultTableCell({
	node: _node,
	children,
}: {
	node: TableCellNode;
	children: ReactNode;
}) {
	return <td data-op-table-cell>{children}</td>;
}

// A `Visitor<ReactNode>` built per render, closing over `components` (which the
// frozen `visit()` does not thread). Container arms own their children: they map
// with an index and wrap each child in a keyed `Fragment` — this replaces the
// `key` parameter the old hand-rolled walk threaded. The `table` arm builds its
// whole subtree, so the row/cell arms are exhaustiveness-only no-ops, exactly as
// the pre-PS-12 walk already treated them (ADR 0001 unifying principle).
function buildVisitor(components: PolicyComponents): Visitor<ReactNode> {
	const kids = (nodes: readonly Node[], v: (child: Node) => ReactNode): ReactNode[] =>
		nodes.map((n, i) => <Fragment key={i}>{v(n)}</Fragment>);

	return {
		document: (node, v) => (
			<>
				{node.sections.map((s, i) => (
					<Fragment key={i}>{v(s)}</Fragment>
				))}
			</>
		),
		section: (node, v) => {
			const SectionComp = components.Section ?? DefaultSection;
			return <SectionComp section={node}>{kids(node.content, v)}</SectionComp>;
		},
		heading: (node) => {
			const HeadingComp = components.Heading ?? DefaultHeading;
			return <HeadingComp node={node} />;
		},
		paragraph: (node, v) => {
			const ParagraphComp = components.Paragraph ?? DefaultParagraph;
			return <ParagraphComp node={node}>{kids(node.children, v)}</ParagraphComp>;
		},
		list: (node, v) => {
			const ListComp = components.List ?? DefaultList;
			return <ListComp node={node}>{kids(node.items, v)}</ListComp>;
		},
		listItem: (node, v) => {
			const ListItemComp = components.ListItem ?? DefaultListItem;
			return <ListItemComp node={node}>{kids(node.children, v)}</ListItemComp>;
		},
		table: (node, v) => {
			const TableComp = components.Table ?? DefaultTable;
			const TableHeaderComp = components.TableHeader ?? DefaultTableHeader;
			const TableBodyComp = components.TableBody ?? DefaultTableBody;
			const TableHeaderRowComp = components.TableHeaderRow ?? DefaultTableHeaderRow;
			const TableRowComp = components.TableRow ?? DefaultTableRow;
			const TableHeadComp = components.TableHead ?? DefaultTableHead;
			const TableCellComp = components.TableCell ?? DefaultTableCell;
			const headerRow = (
				<TableHeaderRowComp node={node.header}>
					{node.header.cells.map((cell, ci) => (
						<TableHeadComp key={ci} node={cell}>
							{kids(cell.children, v)}
						</TableHeadComp>
					))}
				</TableHeaderRowComp>
			);
			const bodyRows = node.rows.map((row, ri) => (
				<TableRowComp key={ri} node={row}>
					{row.cells.map((cell, ci) => (
						<TableCellComp key={ci} node={cell}>
							{kids(cell.children, v)}
						</TableCellComp>
					))}
				</TableRowComp>
			));
			return (
				<TableComp node={node}>
					<TableHeaderComp>{headerRow}</TableHeaderComp>
					<TableBodyComp>{bodyRows}</TableBodyComp>
				</TableComp>
			);
		},
		// Owned by the `table` arm — present only for exhaustiveness.
		tableRow: () => null,
		tableCell: () => null,
		tableHeaderRow: () => null,
		tableHeaderCell: () => null,
		// Forward-compat no-op: unrecognized future block-level nodes are
		// represented as UnknownNode and rendered as nothing (see ADR 0001).
		unknown: () => null,
		text: (node) => {
			const Comp = components.Text ?? DefaultText;
			return <Comp node={node} />;
		},
		bold: (node) => {
			const Comp = components.Bold ?? DefaultBold;
			return <Comp node={node} />;
		},
		italic: (node) => {
			const Comp = components.Italic ?? DefaultItalic;
			return <Comp node={node} />;
		},
		link: (node) => {
			const Comp = components.Link ?? DefaultLink;
			return <Comp node={node} />;
		},
	};
}

export function renderNode(node: Node, components: PolicyComponents): ReactNode {
	return visit(node, buildVisitor(components));
}
