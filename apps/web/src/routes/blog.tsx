import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRightIcon } from "@phosphor-icons/react";
import { allPosts } from "content-collections";
import { Highlight } from "../components/Highlight";
import { pageMeta } from "../lib/seo";

export const Route = createFileRoute("/blog")({
	component: Blog,
	head: (ctx) =>
		pageMeta(
			{
				title: "Blog — notes from building PolicyStack",
				description:
					"Releases, design notes, and the occasional opinion about how the privacy ecosystem could work better.",
				path: "/blog",
			},
			ctx,
		),
});

const posts = [...allPosts].sort((a, b) => b.date.localeCompare(a.date));

function formatDate(date: string) {
	return new Date(date).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

function pad(n: number) {
	return n.toString().padStart(2, "0");
}

function Blog() {
	const [featured, ...rest] = posts;
	return (
		<>
			<section className="border-b-2 border-black">
				<div className="mx-auto max-w-6xl px-8 pt-28 pb-32 md:pt-36 md:pb-40">
					<div className="flex items-center gap-4 text-xs tracking-wide text-mute uppercase">
						<span className="text-ink">[blog]</span>
						<span className="h-0.5 w-10 bg-black" aria-hidden="true" />
						<span>notes &amp; releases</span>
					</div>
					<h1 className="mt-16 max-w-[22ch] text-4xl font-medium tracking-tight text-balance md:text-6xl">
						Notes from <Highlight>building PolicyStack.</Highlight>
					</h1>
					<p className="mt-12 max-w-[55ch] text-lg text-pretty text-mute">
						Releases, design notes, and the occasional opinion about how the privacy ecosystem could
						work better.
					</p>
					<div className="mt-12 flex items-center gap-4 text-xs tracking-wide text-mute uppercase">
						<span className="h-px flex-1 bg-black/20" aria-hidden="true" />
						<span>
							{pad(posts.length)} {posts.length === 1 ? "entry" : "entries"}
						</span>
					</div>
				</div>
			</section>

			<section>
				<div className="mx-auto max-w-6xl px-8 py-24 md:py-32">
					{featured && (
						<Link
							to="/blog/$slug"
							params={{ slug: featured.slug }}
							className="group block border-2 border-black"
						>
							<div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-black px-6 py-3 text-xs tracking-wide text-mute uppercase md:px-8">
								<div className="flex items-center gap-3">
									<span className="inline-block size-2 bg-black" aria-hidden="true" />
									<span className="text-ink">latest</span>
									<span aria-hidden="true">·</span>
									<span>{featured.tag}</span>
								</div>
								<div className="flex items-center gap-3">
									<time dateTime={featured.date}>{formatDate(featured.date)}</time>
									<span aria-hidden="true">·</span>
									<span>{featured.readingTime}</span>
								</div>
							</div>
							<div className="px-6 py-12 md:px-12 md:py-20">
								<h2 className="max-w-[20ch] text-3xl font-medium tracking-tight text-balance text-ink group-hover:underline group-hover:underline-offset-4 md:text-6xl">
									<Highlight>{featured.title}</Highlight>
								</h2>
								<p className="mt-10 max-w-[60ch] text-lg text-pretty text-mute">
									{featured.excerpt}
								</p>
								<div className="mt-12 inline-flex items-center gap-2.5 border-2 border-black bg-black px-5 py-3 text-xs tracking-wide text-white uppercase group-hover:bg-white group-hover:text-black">
									<span>read post</span>
									<ArrowRightIcon
										weight="bold"
										aria-hidden="true"
										className="size-3.5 transition group-hover:translate-x-1"
									/>
								</div>
							</div>
						</Link>
					)}

					{rest.length > 0 && (
						<>
							<div className="mt-24 flex items-center gap-4 text-xs tracking-wide text-mute uppercase">
								<span className="text-ink">[archive]</span>
								<span className="h-0.5 w-10 bg-black" aria-hidden="true" />
								<span>earlier entries</span>
							</div>
							<ul role="list" className="mt-10 border-y-2 border-black divide-y-2 divide-black">
								{rest.map((post) => (
									<li key={post.slug}>
										<Link
											to="/blog/$slug"
											params={{ slug: post.slug }}
											className="group flex flex-wrap items-baseline gap-x-6 gap-y-2 px-2 py-6"
										>
											<time
												className="text-xs tracking-wide text-mute uppercase tabular-nums"
												dateTime={post.date}
											>
												{formatDate(post.date)}
											</time>
											<span className="text-xs tracking-wide text-ink uppercase">{post.tag}</span>
											<span className="flex-1 text-base text-ink group-hover:underline group-hover:underline-offset-4 md:text-lg">
												{post.title}
											</span>
											<span className="text-xs tracking-wide text-mute uppercase">
												{post.readingTime}
											</span>
										</Link>
									</li>
								))}
							</ul>
						</>
					)}
				</div>
			</section>
		</>
	);
}
