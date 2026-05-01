import type { BoldNode, ItalicNode, LinkNode, TextNode } from "@openpolicy/core";
import { h, type VNodeChild } from "vue";
import { DefaultBold, DefaultItalic, DefaultLink, DefaultText } from "../defaults/inline";
import type { PolicyComponents } from "../types";

export function renderText(node: TextNode, components: PolicyComponents, key?: number): VNodeChild {
	const Comp = components.Text ?? DefaultText;
	return h(Comp, { key, node });
}

export function renderBold(node: BoldNode, components: PolicyComponents, key?: number): VNodeChild {
	const Comp = components.Bold ?? DefaultBold;
	return h(Comp, { key, node });
}

export function renderItalic(
	node: ItalicNode,
	components: PolicyComponents,
	key?: number,
): VNodeChild {
	const Comp = components.Italic ?? DefaultItalic;
	return h(Comp, { key, node });
}

export function renderLink(node: LinkNode, components: PolicyComponents, key?: number): VNodeChild {
	const Comp = components.Link ?? DefaultLink;
	return h(Comp, { key, node });
}
