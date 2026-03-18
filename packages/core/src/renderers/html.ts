import { marked } from "marked";
import type { Document } from "../documents/types";
import { renderMarkdown } from "./markdown";

export function renderHTML(doc: Document): string {
	const markdown = renderMarkdown(doc);
	return marked(markdown) as string;
}
