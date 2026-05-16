<script lang="ts">
import { getOverridesContext } from "./context.svelte";
import DefaultBold from "./defaults/DefaultBold.svelte";
import DefaultHeading from "./defaults/DefaultHeading.svelte";
import DefaultItalic from "./defaults/DefaultItalic.svelte";
import DefaultLink from "./defaults/DefaultLink.svelte";
import DefaultList from "./defaults/DefaultList.svelte";
import DefaultParagraph from "./defaults/DefaultParagraph.svelte";
import DefaultSection from "./defaults/DefaultSection.svelte";
import DefaultTable from "./defaults/DefaultTable.svelte";
import DefaultTableBody from "./defaults/DefaultTableBody.svelte";
import DefaultTableCell from "./defaults/DefaultTableCell.svelte";
import DefaultTableHead from "./defaults/DefaultTableHead.svelte";
import DefaultTableHeader from "./defaults/DefaultTableHeader.svelte";
import DefaultTableHeaderRow from "./defaults/DefaultTableHeaderRow.svelte";
import DefaultTableRow from "./defaults/DefaultTableRow.svelte";
import DefaultText from "./defaults/DefaultText.svelte";
import type { RenderPlan } from "./plan";
import RenderNode from "./RenderNode.svelte";

// Generic interpreter for the `RenderPlan` tree produced by the single core
// `visit()` (see plan.ts). There is no `node.type` walk here — the tree shape
// is precomputed; this only maps each slot to its override snippet or default
// component. This is what lets the two old hand-rolled template walks collapse
// onto one visitor (PS-12 / ADR 0001).
let { plan }: { plan: RenderPlan } = $props();
const overridesGetter = getOverridesContext();
const overrides = $derived(overridesGetter());
</script>

{#if plan.k === "frag"}
	{#each plan.children as child, i (i)}
		<RenderNode plan={child} />
	{/each}
{:else if plan.k === "slot"}
	{#snippet kids()}
		{#each plan.children as child, i (i)}
			<RenderNode plan={child} />
		{/each}
	{/snippet}
	{#if plan.slot === "section"}
		{#if overrides.section}
			{@render overrides.section({ section: plan.node, children: kids })}
		{:else}
			<DefaultSection section={plan.node}>{@render kids()}</DefaultSection>
		{/if}
	{:else if plan.slot === "heading"}
		{#if overrides.heading}
			{@render overrides.heading({ node: plan.node })}
		{:else}
			<DefaultHeading node={plan.node} />
		{/if}
	{:else if plan.slot === "paragraph"}
		{#if overrides.paragraph}
			{@render overrides.paragraph({ node: plan.node, children: kids })}
		{:else}
			<DefaultParagraph node={plan.node}>{@render kids()}</DefaultParagraph>
		{/if}
	{:else if plan.slot === "list"}
		{#if overrides.list}
			{@render overrides.list({ node: plan.node, children: kids })}
		{:else}
			<DefaultList node={plan.node}>{@render kids()}</DefaultList>
		{/if}
	{:else if plan.slot === "listItem"}
		<li data-op-list-item="">{@render kids()}</li>
	{:else if plan.slot === "table"}
		{#if overrides.table}
			{@render overrides.table({ node: plan.node, children: kids })}
		{:else}
			<DefaultTable node={plan.node}>{@render kids()}</DefaultTable>
		{/if}
	{:else if plan.slot === "tableHeader"}
		{#if overrides.tableHeader}
			{@render overrides.tableHeader({ children: kids })}
		{:else}
			<DefaultTableHeader>{@render kids()}</DefaultTableHeader>
		{/if}
	{:else if plan.slot === "tableBody"}
		{#if overrides.tableBody}
			{@render overrides.tableBody({ children: kids })}
		{:else}
			<DefaultTableBody>{@render kids()}</DefaultTableBody>
		{/if}
	{:else if plan.slot === "tableHeaderRow"}
		{#if overrides.tableHeaderRow}
			{@render overrides.tableHeaderRow({ node: plan.node, children: kids })}
		{:else}
			<DefaultTableHeaderRow node={plan.node}>{@render kids()}</DefaultTableHeaderRow>
		{/if}
	{:else if plan.slot === "tableRow"}
		{#if overrides.tableRow}
			{@render overrides.tableRow({ node: plan.node, children: kids })}
		{:else}
			<DefaultTableRow node={plan.node}>{@render kids()}</DefaultTableRow>
		{/if}
	{:else if plan.slot === "tableHead"}
		{#if overrides.tableHead}
			{@render overrides.tableHead({ node: plan.node, children: kids })}
		{:else}
			<DefaultTableHead node={plan.node}>{@render kids()}</DefaultTableHead>
		{/if}
	{:else if plan.slot === "tableCell"}
		{#if overrides.tableCell}
			{@render overrides.tableCell({ node: plan.node, children: kids })}
		{:else}
			<DefaultTableCell node={plan.node}>{@render kids()}</DefaultTableCell>
		{/if}
	{:else if plan.slot === "text"}
		{#if overrides.text}
			{@render overrides.text({ node: plan.node })}
		{:else}
			<DefaultText node={plan.node} />
		{/if}
	{:else if plan.slot === "bold"}
		{#if overrides.bold}
			{@render overrides.bold({ node: plan.node })}
		{:else}
			<DefaultBold node={plan.node} />
		{/if}
	{:else if plan.slot === "italic"}
		{#if overrides.italic}
			{@render overrides.italic({ node: plan.node })}
		{:else}
			<DefaultItalic node={plan.node} />
		{/if}
	{:else if plan.slot === "link"}
		{#if overrides.link}
			{@render overrides.link({ node: plan.node })}
		{:else}
			<DefaultLink node={plan.node} />
		{/if}
	{/if}
{/if}
<!-- plan.k === "none": forward-compat no-op for an UnknownNode (ADR 0001). -->
