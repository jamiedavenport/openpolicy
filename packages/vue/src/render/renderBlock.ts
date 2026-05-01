import type {
	DocumentSection,
	HeadingNode,
	ListItemNode,
	ListNode,
	ParagraphNode,
} from "@openpolicy/core";
import { h, type VNodeChild } from "vue";
import { DefaultHeading, DefaultList, DefaultParagraph, DefaultSection } from "../defaults/block";
import type { PolicyComponents } from "../types";
import type { RenderNode } from "./renderNode";

export function renderSection(
	section: DocumentSection,
	components: PolicyComponents,
	renderNode: RenderNode,
	key?: number,
): VNodeChild {
	const SectionComp = components.Section ?? DefaultSection;
	const children = section.content.map((n, i) => renderNode(n, components, i));
	return h(SectionComp, { key, section }, { default: () => children });
}

export function renderHeading(
	node: HeadingNode,
	components: PolicyComponents,
	key?: number,
): VNodeChild {
	const HeadingComp = components.Heading ?? DefaultHeading;
	return h(HeadingComp, { key, node });
}

export function renderParagraph(
	node: ParagraphNode,
	components: PolicyComponents,
	renderNode: RenderNode,
	key?: number,
): VNodeChild {
	const ParagraphComp = components.Paragraph ?? DefaultParagraph;
	const children = node.children.map((n, i) => renderNode(n, components, i));
	return h(ParagraphComp, { key, node }, { default: () => children });
}

export function renderList(
	node: ListNode,
	components: PolicyComponents,
	renderNode: RenderNode,
	key?: number,
): VNodeChild {
	const ListComp = components.List ?? DefaultList;
	const children = node.items.map((item, i) => renderNode(item, components, i));
	return h(ListComp, { key, node }, { default: () => children });
}

export function renderListItem(
	node: ListItemNode,
	components: PolicyComponents,
	renderNode: RenderNode,
	key?: number,
): VNodeChild {
	const children = node.children.map((n, i) => renderNode(n, components, i));
	return h("li", { key, "data-op-list-item": "" }, children);
}
