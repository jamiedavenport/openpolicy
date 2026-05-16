import { createFileRoute } from "@tanstack/react-router";
import { MARKDOWN_HEADERS, MARKETING_PAGES } from "../lib/llms";

export const Route = createFileRoute("/opencookies.md")({
	server: {
		handlers: {
			GET: () => new Response(MARKETING_PAGES.opencookies, { headers: MARKDOWN_HEADERS }),
		},
	},
});
