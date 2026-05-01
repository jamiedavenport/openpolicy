<script lang="ts">
import type { LinkNode } from "@openpolicy/core";

let { node }: { node: LinkNode } = $props();
</script>

<a href={node.href}>{node.value}</a>
