<script lang="ts">
import type { Snippet } from "svelte";

let { children }: { children: Snippet } = $props();
</script>

<thead data-op-table-header="">{@render children()}</thead>
