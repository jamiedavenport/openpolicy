import type {
	BoldNode,
	DocumentSection,
	HeadingNode,
	ItalicNode,
	LinkNode,
	Node,
	TableCellNode,
	TableNode,
	TableRowNode,
	TextNode,
} from "@openpolicy/core";
import type { ReactNode } from "react";
import type { PolicyComponents } from "../types";

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
			{...(section.context?.reason && {
				"data-op-reason": section.context.reason,
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
	node: import("@openpolicy/core").ParagraphNode;
	children: ReactNode;
}) {
	return <p data-op-paragraph>{children}</p>;
}

export function DefaultList({
	node,
	children,
}: {
	node: import("@openpolicy/core").ListNode;
	children: ReactNode;
}) {
	const Tag = node.ordered ? "ol" : "ul";
	return <Tag data-op-list>{children}</Tag>;
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

export function DefaultTableHead({
	node: _node,
	children,
}: {
	node: TableCellNode;
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

export function renderNode(node: Node, components: PolicyComponents, key?: number): ReactNode {
	switch (node.type) {
		case "document":
			return <>{node.sections.map((s, i) => renderNode(s, components, i))}</>;

		case "section": {
			const SectionComp = components.Section ?? DefaultSection;
			return (
				<SectionComp key={key} section={node}>
					{node.content.map((n, i) => renderNode(n, components, i))}
				</SectionComp>
			);
		}

		case "heading": {
			const HeadingComp = components.Heading ?? DefaultHeading;
			return <HeadingComp key={key} node={node} />;
		}

		case "paragraph": {
			const children = node.children.map((n, i) => renderNode(n, components, i));
			if (components.Paragraph)
				return (
					<components.Paragraph key={key} node={node}>
						{children}
					</components.Paragraph>
				);
			return (
				<p key={key} data-op-paragraph>
					{children}
				</p>
			);
		}

		case "list": {
			const children = node.items.map((item, i) => renderNode(item, components, i));
			if (components.List)
				return (
					<components.List key={key} node={node}>
						{children}
					</components.List>
				);
			const ListTag = node.ordered ? "ol" : "ul";
			return (
				<ListTag key={key} data-op-list>
					{children}
				</ListTag>
			);
		}

		case "listItem":
			return (
				<li key={key} data-op-list-item>
					{node.children.map((n, i) => renderNode(n, components, i))}
				</li>
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
			) => (
				<Comp key={cellKey} node={cell}>
					{cell.children.map((n, i) => renderNode(n, components, i))}
				</Comp>
			);
			const renderRow = (
				row: TableRowNode,
				rowKey: number | undefined,
				CellComp: typeof TableHeadComp | typeof TableCellComp,
			) => (
				<TableRowComp key={rowKey} node={row}>
					{row.cells.map((c, ci) => renderCell(c, ci, CellComp))}
				</TableRowComp>
			);
			const headerRow = renderRow(node.header, undefined, TableHeadComp);
			const bodyRows = node.rows.map((row, ri) => renderRow(row, ri, TableCellComp));
			return (
				<TableComp key={key} node={node}>
					<TableHeaderComp>{headerRow}</TableHeaderComp>
					<TableBodyComp>{bodyRows}</TableBodyComp>
				</TableComp>
			);
		}

		case "tableRow":
		case "tableCell":
			return null;

		case "text": {
			const Comp = components.Text ?? DefaultText;
			return <Comp key={key} node={node} />;
		}
		case "bold": {
			const Comp = components.Bold ?? DefaultBold;
			return <Comp key={key} node={node} />;
		}
		case "italic": {
			const Comp = components.Italic ?? DefaultItalic;
			return <Comp key={key} node={node} />;
		}
		case "link": {
			const Comp = components.Link ?? DefaultLink;
			return <Comp key={key} node={node} />;
		}
	}
}
