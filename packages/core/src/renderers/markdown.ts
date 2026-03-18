import type {
	Document,
	InlineNode,
	ListItemNode,
	ListNode,
} from "../documents/types";

function renderInline(node: InlineNode): string {
	switch (node.type) {
		case "text":
			return node.value;
		case "bold":
			return `**${node.value}**`;
		case "link":
			return `[${node.value}](${node.href})`;
	}
}

function renderListItem(item: ListItemNode, indent = ""): string {
	const parts: string[] = [];
	let nestedList: ListNode | null = null;
	for (const child of item.children) {
		if (child.type === "list") {
			nestedList = child;
		} else {
			parts.push(renderInline(child));
		}
	}
	const line = `${indent}- ${parts.join("")}`;
	if (nestedList) {
		const nested = nestedList.items
			.map((i) => renderListItem(i, `${indent}  `))
			.join("\n");
		return `${line}\n${nested}`;
	}
	return line;
}

export function renderMarkdown(doc: Document): string {
	return doc.sections
		.map((section) => {
			// biome-ignore lint/suspicious/useIterableCallbackReturn: typed
			const blocks = section.content.map((node) => {
				switch (node.type) {
					case "heading":
						return `## ${node.value}`;
					case "paragraph":
						return node.children.map(renderInline).join("");
					case "list":
						return node.items.map((item) => renderListItem(item)).join("\n");
				}
			});
			return blocks.join("\n\n");
		})
		.join("\n\n---\n\n");
}
