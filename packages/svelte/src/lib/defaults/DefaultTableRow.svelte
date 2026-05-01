<script lang="ts">
import type { TableRowNode } from "@openpolicy/core";
import type { Snippet } from "svelte";

let {
	children,
}: {
	node: TableRowNode;
	children: Snippet;
} = $props();
</script>

<tr data-op-table-row="">{@render children()}</tr>
