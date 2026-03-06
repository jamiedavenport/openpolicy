import { createFileRoute } from "@tanstack/react-router";
import html from "../policies/terms-of-service.html?raw";

export const Route = createFileRoute("/terms")({
	component: RouteComponent,
});

function RouteComponent() {
	// biome-ignore lint/security/noDangerouslySetInnerHtml: oki
	return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
