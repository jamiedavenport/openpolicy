"use client";

import { PrivacyPolicy } from "@openpolicy/react";

export default function PrivacyPage() {
	return (
		<main
			style={{
				maxWidth: 800,
				margin: "0 auto",
				padding: "40px 24px",
				fontFamily: "sans-serif",
			}}
		>
			<PrivacyPolicy />
		</main>
	);
}
