import type {
	BoldNode,
	DocumentSection,
	HeadingNode,
	ItalicNode,
	LinkNode,
	ListNode,
	Node,
	TextNode,
} from "@openpolicy/core";
import { h, type VNodeChild } from "vue";
import type { PolicyComponents } from "../types";

export function DefaultHeading({ node }: { node: HeadingNode }) {
	const level = node.level ?? 2;
	const tag = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
	return h(tag, { "data-op-heading": "" }, node.value);
}

export function DefaultText({ node }: { node: TextNode }) {
	return node.value;
}

export function DefaultBold({ node }: { node: BoldNode }) {
	return h("strong", null, node.value);
}

function DefaultItalic({ node }: { node: ItalicNode }) {
	return h("em", null, node.value);
}

export function DefaultLink({ node }: { node: LinkNode }) {
	return h("a", { href: node.href }, node.value);
}

export function DefaultSection({
	section,
	children,
}: {
	section: DocumentSection;
	children?: VNodeChild;
}) {
	return h(
		"section",
		{
			"data-op-section": "",
			id: section.id,
			...(section.context?.reason && {
				"data-op-reason": section.context.reason,
			}),
		},
		children ?? undefined,
	);
}

export function DefaultParagraph({
	children,
}: {
	node: import("@openpolicy/core").ParagraphNode;
	children?: VNodeChild;
}) {
	return h("p", { "data-op-paragraph": "" }, children ?? undefined);
}

export function DefaultList({ node, children }: { node: ListNode; children?: VNodeChild }) {
	const tag = node.ordered ? "ol" : "ul";
	return h(tag, { "data-op-list": "" }, children ?? undefined);
}

export function renderNode(node: Node, components: PolicyComponents, key?: number): VNodeChild {
	switch (node.type) {
		case "document":
			return node.sections.map((section, i) => renderNode(section, components, i));

		case "section": {
			const SectionComp = components.Section ?? DefaultSection;
			const children = node.content.map((n, i) => renderNode(n, components, i));
			return h(
				SectionComp,
				{ key, section: node, children },
				{
					default: () => children,
				},
			);
		}

		case "heading": {
			const HeadingComp = components.Heading ?? DefaultHeading;
			return h(HeadingComp, { key, node });
		}

		case "paragraph": {
			const children = node.children.map((n, i) => renderNode(n, components, i));
			if (components.Paragraph) {
				return h(
					components.Paragraph,
					{ key, node, children },
					{
						default: () => children,
					},
				);
			}
			return h("p", { key, "data-op-paragraph": "" }, children);
		}

		case "list": {
			const children = node.items.map((item, i) => renderNode(item, components, i));
			if (components.List) {
				return h(
					components.List,
					{ key, node, children },
					{
						default: () => children,
					},
				);
			}
			const ListTag = node.ordered ? "ol" : "ul";
			return h(ListTag, { key, "data-op-list": "" }, children);
		}

		case "listItem":
			return h(
				"li",
				{ key, "data-op-list-item": "" },
				node.children.map((n, i) => renderNode(n, components, i)),
			);

		case "text": {
			const Comp = components.Text ?? DefaultText;
			return h(Comp, { key, node });
		}

		case "bold": {
			const Comp = components.Bold ?? DefaultBold;
			return h(Comp, { key, node });
		}

		case "italic": {
			const Comp = components.Italic ?? DefaultItalic;
			return h(Comp, { key, node });
		}

		case "link": {
			const Comp = components.Link ?? DefaultLink;
			return h(Comp, { key, node });
		}
	}
}
