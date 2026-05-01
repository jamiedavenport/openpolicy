<script lang="ts">
import type { CookiePolicyConfig, OpenPolicyConfig } from "@openpolicy/core";
import { setOverridesContext } from "./context.svelte";
import RenderNode from "./RenderNode.svelte";
import type { PolicyOverrides } from "./types";
import { resolveDocument } from "./usePolicyDocument.svelte";

type Props = {
	config?: OpenPolicyConfig | CookiePolicyConfig;
	style?: string;
} & PolicyOverrides;

const props: Props = $props();

const doc = $derived(resolveDocument("cookie", props.config));

const overrides = $derived({
	section: props.section,
	heading: props.heading,
	paragraph: props.paragraph,
	list: props.list,
	table: props.table,
	tableHeader: props.tableHeader,
	tableBody: props.tableBody,
	tableRow: props.tableRow,
	tableHead: props.tableHead,
	tableCell: props.tableCell,
	text: props.text,
	bold: props.bold,
	italic: props.italic,
	link: props.link,
}) satisfies PolicyOverrides;

setOverridesContext(() => overrides);
</script>

{#if doc}
	<div data-op-policy="" style={props.style}>
		<RenderNode node={doc} />
	</div>
{/if}
