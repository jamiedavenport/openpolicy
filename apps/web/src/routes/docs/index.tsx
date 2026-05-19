import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowRightIcon } from "@phosphor-icons/react";
import { allDocs } from "content-collections";
import { MdxContent } from "../../components/MdxContent";
import { pageMeta } from "../../lib/seo";
import { docsNav } from "../../lib/docs-nav";

export const Route = createFileRoute("/docs/")({
	component: DocsIndex,
	loader: () => {
		const doc = allDocs.find((d) => d.slug === "index");
		if (!doc) throw notFound();
		return { doc };
	},
	head: (ctx) => {
		if (!ctx.loaderData) return {};
		const { doc } = ctx.loaderData;
		return pageMeta(
			{
				title: `${doc.title} — PolicyStack`,
				description: doc.description ?? "PolicyStack documentation",
				path: "/docs",
			},
			ctx,
		);
	},
});

function DocsIndex() {
	const { doc } = Route.useLoaderData();

	return (
		<article className="py-12 lg:py-20">
			<header>
				<p className="text-xs tracking-wide text-mute uppercase">PolicyStack</p>
				<h1 className="mt-4 text-4xl font-medium tracking-tight text-balance md:text-5xl">
					{doc.title}
				</h1>
				{doc.description && (
					<p className="mt-6 max-w-[60ch] text-lg text-pretty text-mute">{doc.description}</p>
				)}
			</header>

			<div className="mt-12 max-w-[72ch] space-y-6 text-base leading-7 text-pretty text-ink">
				<MdxContent code={doc.body} />
			</div>

			<div className="mt-16 grid gap-6 md:grid-cols-2">
				{docsNav.map((group) => (
					<Link
						key={group.rootSlug}
						to="/docs/$"
						params={{ _splat: group.rootSlug }}
						className="group flex flex-col gap-4 border-2 border-black p-6 hover:bg-ink hover:text-canvas"
					>
						<span className="text-[0.6875rem] tracking-wide text-mute uppercase group-hover:text-canvas/70">
							[{group.index}]
						</span>
						<span className="text-2xl tracking-tight">{group.label}</span>
						<span className="mt-auto inline-flex items-center gap-2 text-xs tracking-wide uppercase">
							Read the docs
							<ArrowRightIcon weight="bold" className="size-3.5 shrink-0" aria-hidden="true" />
						</span>
					</Link>
				))}
			</div>
		</article>
	);
}
