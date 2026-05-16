import { createFileRoute } from "@tanstack/react-router";
import { MARKDOWN_HEADERS, MARKETING_PAGES } from "../lib/llms";

export const Route = createFileRoute("/openpolicy.md")({
	server: {
		handlers: {
			GET: () => new Response(MARKETING_PAGES.openpolicy, { headers: MARKDOWN_HEADERS }),
		},
	},
});
