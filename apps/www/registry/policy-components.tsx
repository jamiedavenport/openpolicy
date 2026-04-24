import type {
	DocumentSection,
	HeadingNode,
	LinkNode,
	ListNode,
	ParagraphNode,
} from "@openpolicy/core";
import type { ReactNode } from "react";

export function PolicySection({
	section,
	children,
}: {
	section: DocumentSection;
	children: ReactNode;
}) {
	return (
		<section
			id={section.id}
			className="pb-8 mb-8 border-b border-gray-100 last:border-0 last:pb-0 last:mb-0"
		>
			{children}
		</section>
	);
}

export function PolicyHeading({ node }: { node: HeadingNode }) {
	const level = node.level ?? 2;
	if (level <= 1) return <h1 className="text-xl font-semibold text-gray-900 mb-3">{node.value}</h1>;
	if (level === 2)
		return <h2 className="text-base font-semibold text-gray-900 mb-2">{node.value}</h2>;
	return <h3 className="text-sm font-semibold text-gray-900 mb-2">{node.value}</h3>;
}

export function PolicyParagraph({ children }: { node: ParagraphNode; children: ReactNode }) {
	return <p className="text-sm text-gray-600 leading-relaxed mb-3">{children}</p>;
}

export function PolicyList({ node, children }: { node: ListNode; children: ReactNode }) {
	const Tag = node.ordered ? "ol" : "ul";
	return <Tag className="text-sm text-gray-600 pl-5 mb-3 space-y-1 list-disc">{children}</Tag>;
}

export function PolicyLink({ node }: { node: LinkNode }) {
	return (
		<a
			href={node.href}
			className="text-gray-900 underline underline-offset-2 hover:text-gray-600 transition-colors"
		>
			{node.value}
		</a>
	);
}
