<script lang="ts">
import type { TextNode } from "@openpolicy/core";

let { node }: { node: TextNode } = $props();
</script>

{node.value}
