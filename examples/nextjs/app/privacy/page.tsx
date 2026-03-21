import { readFile } from "node:fs/promises";
import { join } from "node:path";

export default async function PrivacyPage() {
	const html = await readFile(
		join(process.cwd(), "public/policies/privacy-policy.html"),
		"utf-8",
	);
	return (
		<main className="text-red-500">
			{/** biome-ignore lint/security/noDangerouslySetInnerHtml: oki */}
			<div dangerouslySetInnerHTML={{ __html: html }} />
		</main>
	);
}
