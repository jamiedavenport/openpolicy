import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<main className="mx-auto max-w-6xl px-6 py-16">
			<h1 className="mb-4 text-4xl font-semibold tracking-tight">Baseline</h1>
			<p className="text-lg text-muted-foreground">
				TanStack Start shell without OpenPolicy. Used as the comparison baseline
				for bundle analysis.
			</p>
		</main>
	);
}
