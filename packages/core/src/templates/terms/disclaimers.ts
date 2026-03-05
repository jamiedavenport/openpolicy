import type { PolicySection, TermsOfServiceConfig } from "../../types";

export function buildDisclaimers(
	config: TermsOfServiceConfig,
): PolicySection | null {
	if (!config.disclaimers) return null;

	const lines: string[] = [];

	if (config.disclaimers.serviceProvidedAsIs) {
		lines.push(
			'OUR SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND.',
		);
	}

	if (config.disclaimers.noWarranties) {
		lines.push(
			`${config.company.legalName} EXPRESSLY DISCLAIMS ALL WARRANTIES, WHETHER EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE, INCLUDING WITHOUT LIMITATION ANY IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.`,
		);
	}

	return {
		id: "tos-disclaimers",
		title: "Disclaimer of Warranties",
		body: lines.join("\n\n"),
	};
}
