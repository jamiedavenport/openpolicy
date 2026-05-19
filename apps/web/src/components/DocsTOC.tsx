import { useEffect, useState } from "react";

type Heading = { depth: 2 | 3; value: string; id: string };

export function DocsTOC({ headings }: { headings: Heading[] }) {
	const [activeId, setActiveId] = useState<string | null>(null);

	useEffect(() => {
		if (headings.length === 0) return;
		const observer = new IntersectionObserver(
			(entries) => {
				const visible = entries
					.filter((e) => e.isIntersecting)
					.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
				if (visible) setActiveId(visible.target.id);
			},
			{ rootMargin: "0px 0px -70% 0px", threshold: 0 },
		);
		for (const h of headings) {
			const el = document.getElementById(h.id);
			if (el) observer.observe(el);
		}
		return () => observer.disconnect();
	}, [headings]);

	if (headings.length === 0) return null;

	return (
		<nav aria-label="On this page" className="border-l-2 border-black pl-6 text-sm">
			<p className="text-[0.6875rem] tracking-wide text-mute uppercase">On this page</p>
			<ul role="list" className="mt-4 space-y-2">
				{headings.map((h) => (
					<li key={h.id} className={h.depth === 3 ? "pl-4" : ""}>
						<a
							href={`#${h.id}`}
							className={
								h.id === activeId ? "block py-1 text-ink" : "block py-1 text-mute hover:text-ink"
							}
						>
							{h.value}
						</a>
					</li>
				))}
			</ul>
		</nav>
	);
}
