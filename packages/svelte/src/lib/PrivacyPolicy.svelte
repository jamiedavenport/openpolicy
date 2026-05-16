<script lang="ts">
import type { OpenPolicyConfig, PrivacyPolicyConfig } from "@openpolicy/core";
import { visit } from "@openpolicy/core";
import { setOverridesContext } from "./context.svelte";
import { planVisitor } from "./plan";
import RenderNode from "./RenderNode.svelte";
import type { PolicyOverrides } from "./types";
import { resolveDocument } from "./usePolicyDocument.svelte";

type Props = {
	config?: OpenPolicyConfig | PrivacyPolicyConfig;
	style?: string;
} & PolicyOverrides;

const props: Props = $props();

const doc = $derived(resolveDocument("privacy", props.config));
const plan = $derived(doc ? visit(doc, planVisitor) : null);

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

{#if plan}
	<div data-op-policy="" style={props.style}>
		<RenderNode {plan} />
	</div>
{/if}
