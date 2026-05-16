import { Outlet, createFileRoute, useChildMatches } from "@tanstack/react-router";
import { DocsSidebar } from "../../components/DocsSidebar";
import { DocsMobileNav } from "../../components/DocsMobileNav";
import { DocsSearch } from "../../components/DocsSearch";

export const Route = createFileRoute("/docs")({
	component: DocsLayout,
});

function DocsLayout() {
	const matches = useChildMatches();
	const last = matches[matches.length - 1];
	const params = (last?.params ?? {}) as { _splat?: string };
	const activeSlug = params._splat ?? "";

	return (
		<div className="mx-auto max-w-7xl px-6 lg:grid lg:grid-cols-[var(--docs-sidebar-width)_1fr] lg:gap-x-10 lg:px-8">
			<aside className="hidden border-r-2 border-black lg:block">
				<div className="sticky top-20 max-h-[calc(100dvh-5rem)] overflow-y-auto py-10 pr-6">
					<div className="mb-6 pl-6 pr-2">
						<DocsSearch />
					</div>
					<DocsSidebar activeSlug={activeSlug} />
				</div>
			</aside>

			<div className="min-w-0">
				<div className="flex items-center gap-3 py-5 lg:hidden">
					<DocsMobileNav activeSlug={activeSlug} />
					<div className="flex-1">
						<DocsSearch />
					</div>
				</div>
				<Outlet />
			</div>
		</div>
	);
}
