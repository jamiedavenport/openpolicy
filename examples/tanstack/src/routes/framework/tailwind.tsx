import { PrivacyPolicy } from "@openpolicy/react";
import { createFileRoute } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/framework/tailwind")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div
			className={cn(
				"max-w-2xl mx-auto py-12 px-6",
				"[&_[data-op-section]]:mb-10 [&_[data-op-section]]:border-b [&_[data-op-section]]:border-border [&_[data-op-section]]:pb-10",
				"[&_[data-op-heading]]:text-xl [&_[data-op-heading]]:font-semibold [&_[data-op-heading]]:tracking-tight [&_[data-op-heading]]:mb-4",
				"[&_[data-op-paragraph]]:text-sm [&_[data-op-paragraph]]:text-muted-foreground [&_[data-op-paragraph]]:leading-relaxed [&_[data-op-paragraph]]:mb-3",
				"[&_[data-op-list]]:list-disc [&_[data-op-list]]:list-inside [&_[data-op-list]]:space-y-1 [&_[data-op-list]]:text-sm [&_[data-op-list]]:text-muted-foreground [&_[data-op-list]]:mb-3",
			)}
		>
			<PrivacyPolicy />
		</div>
	);
}
