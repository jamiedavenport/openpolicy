import { createFileRoute } from "@tanstack/react-router";
import { createOgHandler } from "@jxdltd/tanstack/og/server";
import config from "../../og/config";
import template from "../../og/template";

const handler = createOgHandler({ config, template });

export const Route = createFileRoute("/og/$")({
	server: {
		handlers: {
			GET: ({ request }) => handler({ request }),
		},
	},
});
