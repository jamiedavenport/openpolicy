import { Link } from "@tanstack/react-router";
import { docsNav } from "../lib/docs-nav";

export function DocsSidebar({ activeSlug }: { activeSlug: string }) {
	return (
		<nav aria-label="Documentation" className="text-sm">
			{docsNav.map((group) => (
				<div key={group.label} className="border-b-2 border-black py-8 first:pt-0 last:border-b-0">
					<div className="flex items-center gap-3 px-6 text-xs tracking-wide text-mute uppercase">
						<span className="text-ink">[{group.index}]</span>
						<span>{group.label}</span>
						<span aria-hidden="true" className="h-0.5 flex-1 bg-black/15" />
					</div>
					<ul role="list" className="mt-5">
						{group.items.map((item, i) => {
							if (item.type === "subsection") {
								return (
									<li
										key={`sub-${i}`}
										className="mt-6 px-6 text-[0.6875rem] tracking-wide text-mute uppercase first:mt-3"
									>
										{item.label}
									</li>
								);
							}
							const isActive = item.slug === activeSlug;
							return (
								<li key={item.slug}>
									<Link
										to="/docs/$"
										params={{ _splat: item.slug }}
										className={
											isActive
												? "block border-l-2 border-black bg-ink/5 px-6 py-1.5 text-ink"
												: "block border-l-2 border-transparent px-6 py-1.5 text-mute hover:text-ink"
										}
									>
										{item.title}
									</Link>
								</li>
							);
						})}
					</ul>
				</div>
			))}
		</nav>
	);
}
