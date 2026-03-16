import { createFileRoute } from "@tanstack/react-router";
import html from "../policies/privacy-policy.html?raw";

export const Route = createFileRoute("/privacy")({
	component: RouteComponent,
});

function RouteComponent() {
	// biome-ignore lint/security/noDangerouslySetInnerHtml: oki
	return <div className="p-5" dangerouslySetInnerHTML={{ __html: html }} />;
}
