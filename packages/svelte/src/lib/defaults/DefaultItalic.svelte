<script lang="ts">
import type { ItalicNode } from "@openpolicy/core";

let { node }: { node: ItalicNode } = $props();
</script>

<em>{node.value}</em>
