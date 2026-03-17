import type {
	BoldNode,
	DocumentSection,
	LinkNode,
	Node,
	TextNode,
} from "@openpolicy/core";
import { createElement, type ReactNode } from "react";
import type { PolicyComponents } from "../types";

export function DefaultHeading({
	id,
	children,
}: {
	id: string;
	children: ReactNode;
}) {
	return (
		<h2 data-op-heading className="op-heading" id={id}>
			{children}
		</h2>
	);
}

export function DefaultText({ node }: { node: TextNode }) {
	return <>{node.value}</>;
}

export function DefaultBold({ node }: { node: BoldNode }) {
	return <strong className="op-bold">{node.value}</strong>;
}

export function DefaultLink({ node }: { node: LinkNode }) {
	return (
		<a href={node.href} className="op-link">
			{node.value}
		</a>
	);
}

export function DefaultSection({
	section,
	children,
}: {
	section: DocumentSection;
	children: ReactNode;
}) {
	return (
		<section data-op-section className="op-section" id={section.id}>
			{children}
		</section>
	);
}

export function DefaultParagraph({
	node: _node,
	children,
}: {
	node: import("@openpolicy/core").ParagraphNode;
	children: ReactNode;
}) {
	return (
		<p data-op-paragraph className="op-paragraph">
			{children}
		</p>
	);
}

export function DefaultList({
	node: _node,
	children,
}: {
	node: import("@openpolicy/core").ListNode;
	children: ReactNode;
}) {
	return (
		<ul data-op-list className="op-list">
			{children}
		</ul>
	);
}

export function renderNode(
	node: Node,
	components: PolicyComponents,
	key?: number,
): ReactNode {
	switch (node.type) {
		case "document":
			return <>{node.sections.map((s, i) => renderNode(s, components, i))}</>;

		case "section": {
			const SectionComp = components.Section ?? DefaultSection;
			const HeadingComp = components.Heading ?? DefaultHeading;
			return (
				<SectionComp key={key} section={node}>
					<HeadingComp id={node.id}>{node.title}</HeadingComp>
					{node.content.map((n, i) => renderNode(n, components, i))}
				</SectionComp>
			);
		}

		case "paragraph": {
			const children = node.children.map((n, i) =>
				renderNode(n, components, i),
			);
			if (components.Paragraph)
				return (
					<components.Paragraph key={key} node={node}>
						{children}
					</components.Paragraph>
				);
			return (
				<p key={key} data-op-paragraph className="op-paragraph">
					{children}
				</p>
			);
		}

		case "list": {
			const children = node.items.map((item, i) =>
				renderNode(item, components, i),
			);
			if (components.List)
				return (
					<components.List key={key} node={node}>
						{children}
					</components.List>
				);
			return (
				<ul key={key} data-op-list className="op-list">
					{children}
				</ul>
			);
		}

		case "listItem":
			return (
				<li key={key} data-op-list-item className="op-list-item">
					{node.children.map((n, i) => renderNode(n, components, i))}
				</li>
			);

		case "text": {
			const Comp = components.Text ?? DefaultText;
			return <Comp key={key} node={node} />;
		}
		case "bold": {
			const Comp = components.Bold ?? DefaultBold;
			return <Comp key={key} node={node} />;
		}
		case "link": {
			const Comp = components.Link ?? DefaultLink;
			return <Comp key={key} node={node} />;
		}
	}
}
