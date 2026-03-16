import type { ListNode, ParagraphNode } from "@openpolicy/core";
import { type ReactNode, useContext } from "react";
import { InlineComponentsContext } from "../inline-context";

export function DefaultHeading({
	id,
	children,
}: {
	id: string;
	children: ReactNode;
}) {
	return (
		<h2 data-op-heading id={id}>
			{children}
		</h2>
	);
}

export function DefaultParagraph({ node }: { node: ParagraphNode }) {
	const { Text, Bold, Link } = useContext(InlineComponentsContext);
	return (
		<p data-op-paragraph>
			{node.children.map((n, i) => {
				// biome-ignore lint/suspicious/noArrayIndexKey: todo
				if (n.type === "text") return <Text key={i} node={n} />;
				// biome-ignore lint/suspicious/noArrayIndexKey: todo
				if (n.type === "bold") return <Bold key={i} node={n} />;
				// biome-ignore lint/suspicious/noArrayIndexKey: todo
				return <Link key={i} node={n} />;
			})}
		</p>
	);
}

export function DefaultList({ node }: { node: ListNode }) {
	const { Text, Bold, Link } = useContext(InlineComponentsContext);
	return (
		<ul data-op-list>
			{node.items.map((item, i) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: list items have no stable key
				<li key={i} data-op-list-item>
					{item.children.map((n, j) => {
						// biome-ignore lint/suspicious/noArrayIndexKey: todo
						if (n.type === "text") return <Text key={j} node={n} />;
						// biome-ignore lint/suspicious/noArrayIndexKey: todo
						if (n.type === "bold") return <Bold key={j} node={n} />;
						// biome-ignore lint/suspicious/noArrayIndexKey: todo
						return <Link key={j} node={n} />;
					})}
					{item.nested && <DefaultList node={item.nested} />}
				</li>
			))}
		</ul>
	);
}
