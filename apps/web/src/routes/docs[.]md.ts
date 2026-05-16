import { createFileRoute, notFound } from "@tanstack/react-router";
import { allDocs } from "content-collections";
import { MARKDOWN_HEADERS, renderDoc } from "../lib/llms";

export const Route = createFileRoute("/docs.md")({
	server: {
		handlers: {
			GET: () => {
				const doc = allDocs.find((d) => d.slug === "index");
				if (!doc) throw notFound();
				return new Response(renderDoc(doc), { headers: MARKDOWN_HEADERS });
			},
		},
	},
});
