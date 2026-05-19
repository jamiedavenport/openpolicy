import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import { allPosts } from "content-collections";
import { MdxContent } from "../components/MdxContent";
import { pageMeta } from "../lib/seo";
import { MARKDOWN_HEADERS, renderPost } from "../lib/llms";

export const Route = createFileRoute("/blog_/$slug")({
	component: BlogPost,
	server: {
		handlers: {
			GET: ({ params, next }) => {
				if (!params.slug.endsWith(".md")) return next();
				const post = allPosts.find((p) => p.slug === params.slug.slice(0, -3));
				if (!post) throw notFound();
				return new Response(renderPost(post), { headers: MARKDOWN_HEADERS });
			},
		},
	},
	loader: ({ params }) => {
		const post = allPosts.find((p) => p.slug === params.slug);
		if (!post) throw notFound();
		return { post };
	},
	head: (ctx) => {
		if (!ctx.loaderData) return {};
		const { post } = ctx.loaderData;
		return pageMeta(
			{
				title: `${post.title} — PolicyStack`,
				description: post.excerpt,
				path: `/blog/${post.slug}`,
				type: "article",
				publishedTime: post.date,
			},
			ctx,
		);
	},
});

function formatDate(iso: string) {
	return new Date(iso).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

function BlogPost() {
	const { post } = Route.useLoaderData();

	return (
		<>
			<article>
				<header className="border-b-2 border-black">
					<div className="mx-auto max-w-3xl px-8 pt-28 pb-24 md:pt-36 md:pb-32">
						<Link
							to="/blog"
							className="inline-flex items-center gap-2 text-xs tracking-wide text-mute uppercase hover:text-ink"
						>
							<ArrowLeftIcon weight="bold" className="size-3.5 shrink-0" aria-hidden="true" />
							All posts
						</Link>
						<div className="mt-12 flex items-center gap-4 text-xs tracking-wide text-mute uppercase">
							<span className="text-ink">{post.tag}</span>
							<span className="h-0.5 w-10 bg-black" aria-hidden="true" />
							<span>{post.readingTime} read</span>
						</div>
						<h1 className="mt-12 max-w-[22ch] text-4xl font-medium tracking-tight text-balance md:text-6xl">
							{post.title}
						</h1>
						<p className="mt-10 max-w-[55ch] text-lg text-pretty text-mute">{post.excerpt}</p>
						<div className="mt-16 flex items-center gap-4">
							<div aria-hidden="true" className="size-10 border-2 border-black bg-black" />
							<div className="text-sm">
								<p className="text-ink">{post.author}</p>
								<p className="mt-1 text-xs tracking-wide text-mute uppercase">
									<time dateTime={post.date}>{formatDate(post.date)}</time>
									<span className="mx-2">·</span>
									<span>{post.slug}</span>
								</p>
							</div>
						</div>
					</div>
				</header>

				<div className="mx-auto max-w-3xl px-8 py-24 md:py-32">
					<div className="space-y-8 text-lg text-pretty text-ink">
						<MdxContent code={post.body} />
					</div>
				</div>
			</article>

			<section className="border-t-2 border-black">
				<div className="mx-auto max-w-3xl px-8 py-16">
					<div className="flex flex-wrap items-center justify-between gap-6">
						{post.upNext ? (
							<div>
								<p className="text-xs tracking-wide text-mute uppercase">up next</p>
								<p className="mt-3 text-lg text-ink">{post.upNext}</p>
							</div>
						) : (
							<span aria-hidden="true" />
						)}
						<Link
							to="/blog"
							className="inline-flex items-center gap-2.5 border-2 border-black px-6 py-3.5 text-sm tracking-wide uppercase hover:bg-black hover:text-white"
						>
							<ArrowLeftIcon weight="bold" className="size-4 shrink-0" aria-hidden="true" />
							All posts
						</Link>
					</div>
				</div>
			</section>
		</>
	);
}
