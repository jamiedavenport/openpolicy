<script lang="ts">
import type { OpenPolicyConfig } from "@openpolicy/core";
import type { Snippet } from "svelte";
import { setConfigContext } from "./context.svelte";

let {
	config,
	children,
}: {
	config: OpenPolicyConfig;
	children: Snippet;
} = $props();

setConfigContext(() => config);
</script>

{@render children()}
