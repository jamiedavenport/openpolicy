import { PrivacyPolicy } from "@openpolicy/react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/framework/privacy")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="p-5">
			<PrivacyPolicy
				components={{
					Heading: ({ id, children }) => (
						<h2 id={id} className="text-2xl font-bold text-red-500">
							{children}
						</h2>
					),
					List: ({ node: _node, children }) => <ul>{children}</ul>,
				}}
			/>
		</div>
	);
}
