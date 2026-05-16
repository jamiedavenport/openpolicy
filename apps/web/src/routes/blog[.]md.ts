import { createFileRoute } from "@tanstack/react-router";
import { MARKDOWN_HEADERS, renderBlogIndex } from "../lib/llms";

export const Route = createFileRoute("/blog.md")({
	server: {
		handlers: {
			GET: () => new Response(renderBlogIndex(), { headers: MARKDOWN_HEADERS }),
		},
	},
});
