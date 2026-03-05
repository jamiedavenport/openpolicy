import { marked } from "marked";
import type { PolicySection } from "../types";
import { renderMarkdown } from "./markdown";

export function renderHTML(sections: PolicySection[]): string {
	const markdown = renderMarkdown(sections);
	return marked(markdown) as string;
}
