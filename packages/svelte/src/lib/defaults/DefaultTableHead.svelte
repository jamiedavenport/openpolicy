<script lang="ts">
import type { TableCellNode } from "@openpolicy/core";
import type { Snippet } from "svelte";

let {
	children,
}: {
	node: TableCellNode;
	children: Snippet;
} = $props();
</script>

<th data-op-table-cell="" scope="col">{@render children()}</th>
