import type { TableCellNode, TableNode, TableRowNode } from "@openpolicy/core";
import { h, type VNodeChild } from "vue";
import {
	DefaultTable,
	DefaultTableBody,
	DefaultTableCell,
	DefaultTableHead,
	DefaultTableHeader,
	DefaultTableRow,
} from "../defaults/table";
import type { PolicyComponents } from "../types";
import type { RenderNode } from "./renderNode";

export function renderTable(
	node: TableNode,
	components: PolicyComponents,
	renderNode: RenderNode,
	key?: number,
): VNodeChild {
	const TableComp = components.Table ?? DefaultTable;
	const TableHeaderComp = components.TableHeader ?? DefaultTableHeader;
	const TableBodyComp = components.TableBody ?? DefaultTableBody;
	const TableRowComp = components.TableRow ?? DefaultTableRow;
	const TableHeadComp = components.TableHead ?? DefaultTableHead;
	const TableCellComp = components.TableCell ?? DefaultTableCell;

	const renderCell = (
		cell: TableCellNode,
		cellKey: number,
		CellComp: typeof TableHeadComp | typeof TableCellComp,
	) => {
		const cellChildren = cell.children.map((n, i) => renderNode(n, components, i));
		return h(CellComp, { key: cellKey, node: cell }, { default: () => cellChildren });
	};

	const renderRow = (
		row: TableRowNode,
		rowKey: number | undefined,
		CellComp: typeof TableHeadComp | typeof TableCellComp,
	) => {
		const rowChildren = row.cells.map((c, ci) => renderCell(c, ci, CellComp));
		return h(TableRowComp, { key: rowKey, node: row }, { default: () => rowChildren });
	};

	const headerRow = renderRow(node.header, undefined, TableHeadComp);
	const bodyRows = node.rows.map((row, ri) => renderRow(row, ri, TableCellComp));
	const inner = [
		h(TableHeaderComp, null, { default: () => headerRow }),
		h(TableBodyComp, null, { default: () => bodyRows }),
	];
	return h(TableComp, { key, node }, { default: () => inner });
}
