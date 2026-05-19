import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { allDocs } from "content-collections";
import { MdxContent } from "../../components/MdxContent";
import { DocsTOC } from "../../components/DocsTOC";
import { DocsPager } from "../../components/DocsPager";
import { pageMeta } from "../../lib/seo";
import { findGroupForSlug } from "../../lib/docs-nav";
import { MARKDOWN_HEADERS, renderDoc } from "../../lib/llms";

export const Route = createFileRoute("/docs/$")({
	component: DocsPage,
	server: {
		handlers: {
			GET: ({ params, next }) => {
				const splat = params._splat ?? "";
				if (!splat.endsWith(".md")) return next();
				const doc = allDocs.find((d) => d.slug === splat.slice(0, -3));
				if (!doc) throw notFound();
				return new Response(renderDoc(doc), { headers: MARKDOWN_HEADERS });
			},
		},
	},
	loader: ({ params }) => {
		const splat = params._splat ?? "";
		const doc = allDocs.find((d) => d.slug === splat);
		if (!doc) throw notFound();
		return { doc, slug: splat };
	},
	head: (ctx) => {
		if (!ctx.loaderData) return {};
		const { doc, slug } = ctx.loaderData;
		return pageMeta(
			{
				title: `${doc.title} — PolicyStack docs`,
				description: doc.description ?? `${doc.title} — PolicyStack documentation`,
				path: `/docs/${slug}`,
			},
			ctx,
		);
	},
});

function DocsPage() {
	const { doc, slug } = Route.useLoaderData();
	const group = findGroupForSlug(slug);

	return (
		<article className="py-12 lg:grid lg:grid-cols-[1fr_14rem] lg:gap-x-10 lg:py-16">
			<div className="min-w-0">
				<header className="border-b-2 border-black pb-10">
					{group && (
						<p className="text-[0.6875rem] tracking-wide text-mute uppercase">
							<Link to="/docs/$" params={{ _splat: group.rootSlug }} className="hover:text-ink">
								[{group.index}] {group.label}
							</Link>
						</p>
					)}
					<h1 className="mt-5 text-4xl font-medium tracking-tight text-balance md:text-5xl">
						{doc.title}
					</h1>
					{doc.description && (
						<p className="mt-5 max-w-[60ch] text-lg text-pretty text-mute">{doc.description}</p>
					)}
				</header>

				<div className="mt-10 max-w-[72ch] space-y-6 text-base leading-7 text-pretty text-ink">
					<MdxContent code={doc.body} />
				</div>

				<DocsPager slug={slug} />
			</div>

			<aside className="hidden xl:block">
				<div className="sticky top-20 max-h-[calc(100dvh-5rem)] overflow-y-auto pt-2">
					<DocsTOC headings={doc.headings} />
				</div>
			</aside>
		</article>
	);
}
