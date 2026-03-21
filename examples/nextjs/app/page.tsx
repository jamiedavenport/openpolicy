import Link from "next/link";

export default function Home() {
	return (
		<main>
			<h1 className="text-2xl font-bold mb-2">OpenPolicy Next.js Example</h1>
			<p className="text-gray-500 mb-4">
				Policies are rendered at runtime via <code>@openpolicy/react</code>.
			</p>
			<nav className="flex gap-4 flex-wrap">
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
			<p className="text-gray-500 mt-4 text-sm">
				Ask our AI assistant about your rights and what our policies mean for
				you.
			</p>
		</main>
	);
}
