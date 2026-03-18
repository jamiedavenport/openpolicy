import { CookiePolicy } from "@openpolicy/react";
import { createFileRoute } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/framework/cookie")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div
			className={cn(
				"max-w-2xl mx-auto py-12 px-6",
				"**:data-op-section:mb-10 **:data-op-section:border-b **:data-op-section:border-border **:data-op-section:pb-10",
				"**:data-op-heading:text-xl **:data-op-heading:font-semibold **:data-op-heading:tracking-tight **:data-op-heading:mb-4",
				"**:data-op-paragraph:text-sm **:data-op-paragraph:text-muted-foreground **:data-op-paragraph:leading-relaxed **:data-op-paragraph:mb-3",
				"**:data-op-list:list-disc **:data-op-list:list-inside **:data-op-list:space-y-1 **:data-op-list:text-sm **:data-op-list:text-muted-foreground **:data-op-list:mb-3",
			)}
		>
			<CookiePolicy />
		</div>
	);
}
