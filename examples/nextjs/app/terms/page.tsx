import { readFile } from "node:fs/promises";
import { join } from "node:path";

export default async function TermsPage() {
	const html = await readFile(
		join(process.cwd(), "public/policies/terms-of-service.html"),
		"utf-8",
	);
	return (
		<main
			style={{
				maxWidth: 800,
				margin: "0 auto",
				padding: "40px 24px",
				fontFamily: "sans-serif",
			}}
		>
			{/** biome-ignore lint/security/noDangerouslySetInnerHtml: oki */}
			<div dangerouslySetInnerHTML={{ __html: html }} />
		</main>
	);
}
