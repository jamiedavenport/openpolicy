import { PrivacyPolicy } from "@openpolicy/react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/framework/privacy")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="p-5">
			<PrivacyPolicy />
		</div>
	);
}
