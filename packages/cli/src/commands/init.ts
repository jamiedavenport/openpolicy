import { resolve } from "node:path";
import type { Jurisdiction } from "@openpolicy/core";
import { defineCommand } from "citty";
import consola from "consola";

const DATA_CATEGORY_MAP: Record<string, { group: string; label: string }> = {
	name: { group: "Personal Information", label: "Full name" },
	email: { group: "Personal Information", label: "Email address" },
	ip_address: { group: "Technical Data", label: "IP address" },
	device_info: { group: "Technical Data", label: "Device type and browser" },
	location: { group: "Location Data", label: "Approximate location" },
	payment_info: { group: "Financial Data", label: "Payment card details" },
	usage_data: { group: "Usage Data", label: "Pages visited and features used" },
};

function toJurisdictions(choice: string): Jurisdiction[] {
	if (choice === "gdpr") return ["eu"];
	if (choice === "ccpa") return ["ca"];
	if (choice === "both") return ["eu", "ca"];
	return ["us"];
}

function toDataCollected(categories: string[]): Record<string, string[]> {
	const groups: Record<string, string[]> = {};
	for (const cat of categories) {
		const mapping = DATA_CATEGORY_MAP[cat];
		if (!mapping) continue;
		groups[mapping.group] = [...(groups[mapping.group] ?? []), mapping.label];
	}
	return Object.keys(groups).length > 0
		? groups
		: { "Personal Information": ["Email address"] };
}

function toUserRights(jurisdictions: Jurisdiction[]): string[] {
	const rights = new Set<string>(["access", "erasure"]);
	if (jurisdictions.includes("eu")) {
		for (const r of [
			"rectification",
			"portability",
			"restriction",
			"objection",
		])
			rights.add(r);
	}
	if (jurisdictions.includes("ca")) {
		for (const r of ["opt_out_sale", "non_discrimination"]) rights.add(r);
	}
	return Array.from(rights);
}

function renderPrivacyConfig(values: {
	companyName: string;
	legalName: string;
	address: string;
	contact: string;
	jurisdictions: Jurisdiction[];
	dataCollected: Record<string, string[]>;
	legalBasis: string;
	hasCookies: boolean;
	userRights: string[];
}): string {
	const dataLines = Object.entries(values.dataCollected)
		.map(([k, v]) => `      ${JSON.stringify(k)}: ${JSON.stringify(v)},`)
		.join("\n");

	const today = new Date().toISOString().slice(0, 10);

	return `import { defineConfig } from "@openpolicy/sdk";

export default defineConfig({
  company: {
    name: ${JSON.stringify(values.companyName)},
    legalName: ${JSON.stringify(values.legalName)},
    address: ${JSON.stringify(values.address)},
    contact: ${JSON.stringify(values.contact)},
  },
  privacy: {
    effectiveDate: "${today}",
    dataCollected: {
${dataLines}
    },
    legalBasis: ${JSON.stringify(values.legalBasis)},
    retention: {
      "All personal data": "As long as necessary for the purposes described in this policy",
    },
    cookies: {
      essential: true,
      analytics: ${values.hasCookies},
      marketing: false,
    },
    thirdParties: [],
    userRights: ${JSON.stringify(values.userRights)},
    jurisdictions: ${JSON.stringify(values.jurisdictions)},
  },
});
`;
}

function renderTermsConfig(values: {
	companyName: string;
	legalName: string;
	address: string;
	contact: string;
	jurisdiction: string;
}): string {
	const today = new Date().toISOString().slice(0, 10);

	return `import { defineConfig } from "@openpolicy/sdk";

export default defineConfig({
  company: {
    name: ${JSON.stringify(values.companyName)},
    legalName: ${JSON.stringify(values.legalName)},
    address: ${JSON.stringify(values.address)},
    contact: ${JSON.stringify(values.contact)},
  },
  terms: {
    effectiveDate: "${today}",
    acceptance: {
      methods: ["using the service", "creating an account"],
    },
    eligibility: {
      minimumAge: 13,
    },
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
    intellectualProperty: {
      companyOwnsService: true,
      usersMayNotCopy: true,
    },
    termination: {
      companyCanTerminate: true,
      userCanTerminate: true,
    },
    disclaimers: {
      serviceProvidedAsIs: true,
      noWarranties: true,
    },
    limitationOfLiability: {
      excludesIndirectDamages: true,
    },
    governingLaw: {
      jurisdiction: ${JSON.stringify(values.jurisdiction)},
    },
    changesPolicy: {
      noticeMethod: "email or prominent notice on our website",
      noticePeriodDays: 30,
    },
  },
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
			default: "",
		},
		yes: {
			type: "boolean",
			description: "Skip prompts and use defaults (CI mode)",
			default: false,
		},
		type: {
			type: "string",
			description: 'Policy type: "privacy" or "terms"',
			default: "privacy",
		},
	},
	async run({ args }) {
		const policyType = args.type === "terms" ? "terms" : "privacy";
		const defaultOut =
			policyType === "terms" ? "./terms.config.ts" : "./privacy.config.ts";

		consola.start(`OpenPolicy init wizard (${policyType})`);

		const companyName = String(
			await consola.prompt("Company name?", { type: "text", cancel: "reject" }),
		);

		const legalName = String(
			await consola.prompt("Legal entity name?", {
				type: "text",
				cancel: "reject",
				initial: companyName,
			}),
		);

		const address = String(
			await consola.prompt("Company address?", {
				type: "text",
				cancel: "reject",
			}),
		);

		const contact = String(
			await consola.prompt(
				policyType === "terms"
					? "Legal contact email?"
					: "Privacy contact email?",
				{
					type: "text",
					cancel: "reject",
				},
			),
		);

		let source: string;

		if (policyType === "terms") {
			const jurisdiction = String(
				await consola.prompt(
					"Governing law jurisdiction? (e.g. Delaware, USA)",
					{
						type: "text",
						cancel: "reject",
						initial: "Delaware, USA",
					},
				),
			);

			source = renderTermsConfig({
				companyName,
				legalName,
				address,
				contact,
				jurisdiction,
			});
		} else {
			const jurisdictionChoice = String(
				await consola.prompt("Jurisdiction?", {
					type: "select",
					cancel: "reject",
					options: ["gdpr", "ccpa", "both"],
				}),
			);

			const dataCategories = (await consola.prompt(
				"Data categories collected?",
				{
					type: "multiselect",
					cancel: "reject",
					options: [
						"name",
						"email",
						"ip_address",
						"device_info",
						"location",
						"payment_info",
						"usage_data",
					],
				},
			)) as string[];

			const hasCookies = Boolean(
				await consola.prompt("Does your app use cookies?", {
					type: "confirm",
					cancel: "reject",
					initial: true,
				}),
			);

			const jurisdictions = toJurisdictions(jurisdictionChoice);
			const dataCollected = toDataCollected(dataCategories);
			const userRights = toUserRights(jurisdictions);
			const legalBasis = jurisdictions.includes("eu")
				? "Legitimate interests and consent"
				: "";

			source = renderPrivacyConfig({
				companyName,
				legalName,
				address,
				contact,
				jurisdictions,
				dataCollected,
				legalBasis,
				hasCookies,
				userRights,
			});
		}

		const outPath = resolve(args.out || defaultOut);
		await Bun.write(outPath, source);
		consola.success(`Config written to ${outPath}`);
	},
});
