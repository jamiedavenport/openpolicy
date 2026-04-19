import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { defineCommand } from "citty";
import consola from "consola";

export function getOpenPolicyTemplate(
	companyName: string,
	contactEmail: string,
	policies: string[],
): string {
	const today = new Date().toISOString().slice(0, 10);
	const wantPrivacy = policies.includes("privacy");
	const wantCookie = policies.includes("cookie");

	const privacyFields = wantPrivacy
		? `
	dataCollected: {
		"Personal Information": ["Email address"],
	},
	legalBasis: "legitimate_interests",
	retention: {
		"All personal data": "As long as necessary for the purposes described in this policy",
	},
	thirdParties: [],`
		: "";

	const cookieFields = wantCookie
		? `
	cookies: { essential: true, analytics: false, functional: false, marketing: false },`
		: "";

	return `import { defineConfig } from "@openpolicy/sdk";

export default defineConfig({
	company: {
		name: "${companyName}",
		legalName: "${companyName}",
		address: "",
		contact: "${contactEmail}",
	},
	effectiveDate: "${today}",
	jurisdictions: ["us"],${privacyFields}${cookieFields}
});
`;
}

export const initCommand = defineCommand({
	meta: {
		name: "init",
		description: "Interactively create a policy config file",
	},
	args: {
		out: {
			type: "string",
			description: "Output path for generated config",
			default: "openpolicy.ts",
		},
	},
	async run({ args }) {
		consola.box(
			"Welcome to OpenPolicy\nGenerate privacy policies and cookie policies from a single config file.",
		);
		consola.start("Let's get you set up.");

		const companyName = String(
			await consola.prompt("Company name?", { type: "text", cancel: "reject" }),
		);

		const contactEmail = String(
			await consola.prompt("Contact email?", {
				type: "text",
				cancel: "reject",
			}),
		);

		const policies = (await consola.prompt("Which policies do you need?", {
			type: "multiselect",
			cancel: "reject",
			options: ["privacy", "cookie"],
		})) as string[];

		const source = getOpenPolicyTemplate(companyName, contactEmail, policies);

		const outPath = resolve(args.out);
		await writeFile(outPath, source);
		consola.success(`Config written to ${outPath}`);
		consola.info(
			`Open ${outPath} and fill in your company's details — address, legal name, and any policy-specific fields.`,
		);
		consola.info(
			`When you're ready, run:\n\n  openpolicy generate ${args.out}\n\nto compile your policies to HTML or Markdown.`,
		);
	},
});
