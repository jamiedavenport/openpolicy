import { PrivacyPolicy } from "@openpolicy/react";
import { createFileRoute } from "@tanstack/react-router";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";

export const Route = createFileRoute("/framework/shadcn")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="p-20 flex flex-col items-center">
			<PrivacyPolicy
				components={{
					Heading: ({ node }) => {
						if (node.context?.reason) {
							return (
								<Tooltip>
									<TooltipTrigger className="mb-3">
										<h2 className="text-2xl font-bold border-b-2 border-dashed border-blue-200 hover:border-blue-400">
											{node.value}
										</h2>
									</TooltipTrigger>
									<TooltipContent side="right">
										{node.context.reason}
									</TooltipContent>
								</Tooltip>
							);
						}

						return <h2 className="text-2xl font-bold mb-3">{node.value}</h2>;
					},
				}}
			/>
		</div>
	);
}
