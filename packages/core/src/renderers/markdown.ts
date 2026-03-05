import type { PolicySection } from "../types";

export function renderMarkdown(sections: PolicySection[]): string {
	return sections
		.map((section) => `## ${section.title}\n\n${section.body}`)
		.join("\n\n---\n\n");
}
