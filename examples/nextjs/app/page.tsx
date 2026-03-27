import Link from "next/link";

const cookieExamples = [
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

export default function Home() {
	return (
		<main>
			<h1 className="text-2xl font-bold mb-2">OpenPolicy Next.js Example</h1>
			<p className="text-gray-500 mb-6">
				Policies are rendered at runtime via <code>@openpolicy/react</code>.
			</p>
			<nav className="flex gap-4 flex-wrap mb-8">
				<Link href="/privacy" className="text-blue-500">
					Privacy Policy
				</Link>
				<Link href="/terms" className="text-blue-500">
					Terms of Service
				</Link>
				<Link href="/chat" className="text-blue-500">
					AI Legal Assistant
				</Link>
			</nav>

			<section>
				<h2 className="text-lg font-semibold mb-3">Cookie Banner Examples</h2>
				<div className="grid gap-4 sm:grid-cols-2">
					{cookieExamples.map(({ href, title, description }) => (
						<Link
							key={href}
							href={href}
							className="block rounded-lg border p-4 hover:bg-gray-50 transition-colors"
						>
							<h3 className="font-medium mb-1">{title}</h3>
							<p className="text-sm text-gray-500">{description}</p>
						</Link>
					))}
				</div>
			</section>

			<p className="text-gray-500 mt-6 text-sm">
				Ask our AI assistant about your rights and what our policies mean for
				you.
			</p>
		</main>
	);
}
