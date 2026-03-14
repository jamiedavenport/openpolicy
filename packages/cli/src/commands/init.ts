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

	const privacySection = policies.includes("privacy")
		? `
	privacy: {
		effectiveDate: "${today}",
		dataCollected: {
			"Personal Information": ["Email address"],
		},
		legalBasis: "Legitimate interests",
		retention: {
			"All personal data": "As long as necessary for the purposes described in this policy",
		},
		cookies: { essential: true, analytics: false, marketing: false },
		thirdParties: [],
		userRights: ["access", "erasure"],
		jurisdictions: ["us"],
	},`
		: "";

	const termsSection = policies.includes("terms")
		? `
	terms: {
		effectiveDate: "${today}",
		acceptance: { methods: ["using the service", "creating an account"] },
		eligibility: { minimumAge: 13 },
		accounts: {
			registrationRequired: false,
			userResponsibleForCredentials: true,
			companyCanTerminate: true,
		},
		prohibitedUses: [
			"Violating any applicable laws or regulations",
			"Infringing on intellectual property rights",
			"Transmitting harmful or malicious content",
		],
		intellectualProperty: { companyOwnsService: true, usersMayNotCopy: true },
		termination: { companyCanTerminate: true, userCanTerminate: true },
		disclaimers: { serviceProvidedAsIs: true, noWarranties: true },
		limitationOfLiability: { excludesIndirectDamages: true },
		governingLaw: { jurisdiction: "Delaware, USA" },
		changesPolicy: {
			noticeMethod: "email or prominent notice on our website",
			noticePeriodDays: 30,
		},
	},`
		: "";

	const cookieSection = policies.includes("cookie")
		? `
	cookie: {
		effectiveDate: "${today}",
		cookies: { essential: true, analytics: false, functional: false, marketing: false },
		jurisdictions: ["us"],
	},`
		: "";

	return `import { defineConfig } from "@openpolicy/sdk";

export default defineConfig({
	company: {
		name: "${companyName}",
		legalName: "${companyName}",
		address: "",
		contact: "${contactEmail}",
	},${privacySection}${termsSection}${cookieSection}
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
			"Welcome to OpenPolicy\nGenerate privacy policies, terms of service, and cookie policies from a single config file.",
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
			options: ["privacy", "terms", "cookie"],
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
