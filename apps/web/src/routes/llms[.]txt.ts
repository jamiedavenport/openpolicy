import { createFileRoute } from "@tanstack/react-router";
import { PLAIN_HEADERS, renderLlmsTxt } from "../lib/llms";

export const Route = createFileRoute("/llms.txt")({
	server: {
		handlers: {
			GET: () => new Response(renderLlmsTxt(), { headers: PLAIN_HEADERS }),
		},
	},
});
