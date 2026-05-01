<script lang="ts">
import type { BoldNode } from "@openpolicy/core";

let { node }: { node: BoldNode } = $props();
</script>

<strong>{node.value}</strong>
