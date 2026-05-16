import { Link } from "@tanstack/react-router";
import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react";
import { findAdjacent } from "../lib/docs-nav";

export function DocsPager({ slug }: { slug: string }) {
	const { prev, next } = findAdjacent(slug);
	if (!prev && !next) return null;

	return (
		<nav
			aria-label="Pagination"
			className="mt-20 grid gap-4 border-t-2 border-black pt-10 sm:grid-cols-2"
		>
			{prev ? (
				<Link
					to="/docs/$"
					params={{ _splat: prev.slug }}
					className="group flex flex-col gap-2 border-2 border-black p-5 hover:bg-ink hover:text-canvas"
				>
					<span className="inline-flex items-center gap-2 text-[0.6875rem] tracking-wide text-mute uppercase group-hover:text-canvas/70">
						<ArrowLeftIcon weight="bold" className="size-3.5 shrink-0" aria-hidden="true" />
						Previous
					</span>
					<span className="text-base">{prev.title}</span>
				</Link>
			) : (
				<span aria-hidden="true" />
			)}
			{next ? (
				<Link
					to="/docs/$"
					params={{ _splat: next.slug }}
					className="group flex flex-col gap-2 border-2 border-black p-5 text-right hover:bg-ink hover:text-canvas sm:items-end"
				>
					<span className="inline-flex items-center gap-2 text-[0.6875rem] tracking-wide text-mute uppercase group-hover:text-canvas/70">
						Next
						<ArrowRightIcon weight="bold" className="size-3.5 shrink-0" aria-hidden="true" />
					</span>
					<span className="text-base">{next.title}</span>
				</Link>
			) : (
				<span aria-hidden="true" />
			)}
		</nav>
	);
}
