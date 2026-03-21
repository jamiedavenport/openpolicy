"use client";

import { TermsOfService } from "@openpolicy/react";

export default function TermsPage() {
	return (
		<main
			style={{
				maxWidth: 800,
				margin: "0 auto",
				padding: "40px 24px",
				fontFamily: "sans-serif",
			}}
		>
			<TermsOfService />
		</main>
	);
}
