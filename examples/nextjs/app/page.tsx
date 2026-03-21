import Link from "next/link";

export default function Home() {
	return (
		<main
			style={{
				fontFamily: "sans-serif",
				maxWidth: 600,
				margin: "80px auto",
				padding: "0 24px",
			}}
		>
			<h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
				OpenPolicy Next.js Example
			</h1>
			<p style={{ color: "#666", marginBottom: "2rem" }}>
				Policies are rendered at runtime via <code>@openpolicy/react</code>.
			</p>
			<nav style={{ display: "flex", gap: "1rem" }}>
				<Link href="/privacy" style={{ color: "#0070f3" }}>
					Privacy Policy
				</Link>
				<Link href="/terms" style={{ color: "#0070f3" }}>
					Terms of Service
				</Link>
			</nav>
		</main>
	);
}
