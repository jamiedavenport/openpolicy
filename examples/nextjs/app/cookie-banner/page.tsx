import Link from "next/link";

const examples = [
	{
		href: "/cookie-banner/default",
		title: "Default",
		description: "Zero-config drop-in banner — no styling required.",
	},
	{
		href: "/cookie-banner/tailwind",
		title: "Tailwind",
		description: "Compound components styled with Tailwind utility classes.",
	},
	{
		href: "/cookie-banner/shadcn",
		title: "shadcn/ui",
		description: "asChild integration with shadcn/ui Button variants.",
	},
	{
		href: "/cookie-banner/css",
		title: "CSS",
		description:
			"CSS transitions driven by data-state attributes — no Tailwind.",
	},
];

export default function CookieBannerIndexPage() {
	return (
		<main>
			<h1 className="text-2xl font-bold mb-2">Cookie Banner Examples</h1>
			<p className="text-gray-500 mb-6">
				The compound component API lets you render just the default banner or
				fully compose your own layout — swap in your own design system, wire up
				custom checkboxes, or style with plain CSS.
			</p>
			<div className="grid gap-4 sm:grid-cols-2">
				{examples.map(({ href, title, description }) => (
					<Link
						key={href}
						href={href}
						className="block rounded-lg border p-5 hover:bg-gray-50 transition-colors"
					>
						<h2 className="font-semibold mb-1">{title}</h2>
						<p className="text-sm text-gray-500">{description}</p>
					</Link>
				))}
			</div>
		</main>
	);
}
