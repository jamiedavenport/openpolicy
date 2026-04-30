import type {
	BoldNode,
	DocumentSection,
	HeadingNode,
	ItalicNode,
	LinkNode,
	ListNode,
	Node,
	TableCellNode,
	TableNode,
	TableRowNode,
	TextNode,
} from "@openpolicy/core";
import { h, type VNodeChild } from "vue";
import type { PolicyComponents } from "../types";

export function DefaultHeading({ node }: { node: HeadingNode }) {
	const level = node.level ?? 2;
	const tag = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
	return h(tag, { "data-op-heading": "" }, node.value);
}

export function DefaultText({ node }: { node: TextNode }) {
	return node.value;
}

export function DefaultBold({ node }: { node: BoldNode }) {
	return h("strong", null, node.value);
}

function DefaultItalic({ node }: { node: ItalicNode }) {
	return h("em", null, node.value);
}

export function DefaultLink({ node }: { node: LinkNode }) {
	return h("a", { href: node.href }, node.value);
}

export function DefaultSection({
	section,
	children,
}: {
	section: DocumentSection;
	children?: VNodeChild;
}) {
	return h(
		"section",
		{
			"data-op-section": "",
			id: section.id,
			...(section.context?.reason && {
				"data-op-reason": section.context.reason,
			}),
		},
		children ?? undefined,
	);
}

export function DefaultParagraph({
	children,
}: {
	node: import("@openpolicy/core").ParagraphNode;
	children?: VNodeChild;
}) {
	return h("p", { "data-op-paragraph": "" }, children ?? undefined);
}

export function DefaultList({ node, children }: { node: ListNode; children?: VNodeChild }) {
	const tag = node.ordered ? "ol" : "ul";
	return h(tag, { "data-op-list": "" }, children ?? undefined);
}

export function DefaultTable({
	node: _node,
	children,
}: {
	node: TableNode;
	children?: VNodeChild;
}) {
	return h("table", { "data-op-table": "" }, children ?? undefined);
}

export function DefaultTableHeader({ children }: { children?: VNodeChild }) {
	return h("thead", { "data-op-table-header": "" }, children ?? undefined);
}

export function DefaultTableBody({ children }: { children?: VNodeChild }) {
	return h("tbody", { "data-op-table-body": "" }, children ?? undefined);
}

export function DefaultTableRow({
	node: _node,
	children,
}: {
	node: TableRowNode;
	children?: VNodeChild;
}) {
	return h("tr", { "data-op-table-row": "" }, children ?? undefined);
}

export function DefaultTableHead({
	node: _node,
	children,
}: {
	node: TableCellNode;
	children?: VNodeChild;
}) {
	return h("th", { "data-op-table-cell": "", scope: "col" }, children ?? undefined);
}

export function DefaultTableCell({
	node: _node,
	children,
}: {
	node: TableCellNode;
	children?: VNodeChild;
}) {
	return h("td", { "data-op-table-cell": "" }, children ?? undefined);
}

export function renderNode(node: Node, components: PolicyComponents, key?: number): VNodeChild {
	switch (node.type) {
		case "document":
			return node.sections.map((section, i) => renderNode(section, components, i));

		case "section": {
			const SectionComp = components.Section ?? DefaultSection;
			const children = node.content.map((n, i) => renderNode(n, components, i));
			return h(
				SectionComp,
				{ key, section: node, children },
				{
					default: () => children,
				},
			);
		}

		case "heading": {
			const HeadingComp = components.Heading ?? DefaultHeading;
			return h(HeadingComp, { key, node });
		}

		case "paragraph": {
			const children = node.children.map((n, i) => renderNode(n, components, i));
			if (components.Paragraph) {
				return h(
					components.Paragraph,
					{ key, node, children },
					{
						default: () => children,
					},
				);
			}
			return h("p", { key, "data-op-paragraph": "" }, children);
		}

		case "list": {
			const children = node.items.map((item, i) => renderNode(item, components, i));
			if (components.List) {
				return h(
					components.List,
					{ key, node, children },
					{
						default: () => children,
					},
				);
			}
			const ListTag = node.ordered ? "ol" : "ul";
			return h(ListTag, { key, "data-op-list": "" }, children);
		}

		case "listItem":
			return h(
				"li",
				{ key, "data-op-list-item": "" },
				node.children.map((n, i) => renderNode(n, components, i)),
			);

		case "table": {
			const TableComp = components.Table ?? DefaultTable;
			const TableHeaderComp = components.TableHeader ?? DefaultTableHeader;
			const TableBodyComp = components.TableBody ?? DefaultTableBody;
			const TableRowComp = components.TableRow ?? DefaultTableRow;
			const TableHeadComp = components.TableHead ?? DefaultTableHead;
			const TableCellComp = components.TableCell ?? DefaultTableCell;
			const renderCell = (
				cell: TableCellNode,
				cellKey: number,
				Comp: typeof TableHeadComp | typeof TableCellComp,
			) => {
				const cellChildren = cell.children.map((n, i) => renderNode(n, components, i));
				return h(
					Comp,
					{ key: cellKey, node: cell, children: cellChildren },
					{ default: () => cellChildren },
				);
			};
			const renderRow = (
				row: TableRowNode,
				rowKey: number | undefined,
				CellComp: typeof TableHeadComp | typeof TableCellComp,
			) => {
				const rowChildren = row.cells.map((c, ci) => renderCell(c, ci, CellComp));
				return h(
					TableRowComp,
					{ key: rowKey, node: row, children: rowChildren },
					{ default: () => rowChildren },
				);
			};
			const headerRow = renderRow(node.header, undefined, TableHeadComp);
			const bodyRows = node.rows.map((row, ri) => renderRow(row, ri, TableCellComp));
			const headerSlot = h(TableHeaderComp, { children: headerRow }, { default: () => headerRow });
			const bodySlot = h(TableBodyComp, { children: bodyRows }, { default: () => bodyRows });
			const inner = [headerSlot, bodySlot];
			return h(TableComp, { key, node, children: inner }, { default: () => inner });
		}

		case "tableRow":
		case "tableCell":
			return null;

		case "text": {
			const Comp = components.Text ?? DefaultText;
			return h(Comp, { key, node });
		}

		case "bold": {
			const Comp = components.Bold ?? DefaultBold;
			return h(Comp, { key, node });
		}

		case "italic": {
			const Comp = components.Italic ?? DefaultItalic;
			return h(Comp, { key, node });
		}

		case "link": {
			const Comp = components.Link ?? DefaultLink;
			return h(Comp, { key, node });
		}
	}
}
