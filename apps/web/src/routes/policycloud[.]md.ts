import { createFileRoute } from "@tanstack/react-router";
import { MARKDOWN_HEADERS, MARKETING_PAGES } from "../lib/llms";

export const Route = createFileRoute("/policycloud.md")({
	server: {
		handlers: {
			GET: () => new Response(MARKETING_PAGES.policycloud, { headers: MARKDOWN_HEADERS }),
		},
	},
});
