import type { Document, InlineNode, ListItemNode, ListNode } from "@openpolicy/core";

function escapeHtml(str: string): string {
	return str
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}

function renderInline(node: InlineNode): string {
	switch (node.type) {
		case "text":
			return escapeHtml(node.value);
		case "bold":
			return `<strong>${escapeHtml(node.value)}</strong>`;
		case "italic":
			return `<em>${escapeHtml(node.value)}</em>`;
		case "link":
			return `<a href="${escapeHtml(node.href)}">${escapeHtml(node.value)}</a>`;
	}
}

function renderListItem(item: ListItemNode): string {
	const content = item.children
		.map((child) => (child.type === "list" ? renderList(child) : renderInline(child as InlineNode)))
		.join("");
	return `<li>${content}</li>`;
}

function renderList(node: ListNode): string {
	const tag = node.ordered ? "ol" : "ul";
	const items = node.items.map(renderListItem).join("");
	return `<${tag}>${items}</${tag}>`;
}

export function renderHTML(doc: Document): string {
	return doc.sections
		.map((section) => {
			// biome-ignore lint/suspicious/useIterableCallbackReturn: typed
			const blocks = section.content.map((node) => {
				switch (node.type) {
					case "heading": {
						const level = node.level ?? 2;
						return `<h${level}>${escapeHtml(node.value)}</h${level}>`;
					}
					case "paragraph":
						return `<p>${node.children.map(renderInline).join("")}</p>`;
					case "list":
						return renderList(node);
				}
			});
			return blocks.join("\n");
		})
		.join("\n");
}
