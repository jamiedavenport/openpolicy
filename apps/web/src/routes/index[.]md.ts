import { createFileRoute } from "@tanstack/react-router";
import { MARKDOWN_HEADERS, MARKETING_PAGES } from "../lib/llms";

export const Route = createFileRoute("/index.md")({
	server: {
		handlers: {
			GET: () => new Response(MARKETING_PAGES.index, { headers: MARKDOWN_HEADERS }),
		},
	},
});
