import type { BoldNode, LinkNode, TextNode } from "@openpolicy/core";
import { type ComponentType, createContext } from "react";

export interface InlineComponents {
	Text: ComponentType<{ node: TextNode }>;
	Bold: ComponentType<{ node: BoldNode }>;
	Link: ComponentType<{ node: LinkNode }>;
}

export function DefaultText({ node }: { node: TextNode }) {
	return <>{node.value}</>;
}

export function DefaultBold({ node }: { node: BoldNode }) {
	return <strong>{node.value}</strong>;
}

export function DefaultLink({ node }: { node: LinkNode }) {
	return <a href={node.href}>{node.value}</a>;
}

export const InlineComponentsContext = createContext<InlineComponents>({
	Text: DefaultText,
	Bold: DefaultBold,
	Link: DefaultLink,
});
