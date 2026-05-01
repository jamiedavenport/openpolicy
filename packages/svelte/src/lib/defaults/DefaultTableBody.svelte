<script lang="ts">
import type { Snippet } from "svelte";

let { children }: { children: Snippet } = $props();
</script>

<tbody data-op-table-body="">{@render children()}</tbody>
