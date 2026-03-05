import type { PolicySection, TermsOfServiceConfig } from "../../types";

export function buildIntellectualProperty(
	config: TermsOfServiceConfig,
): PolicySection | null {
	if (!config.intellectualProperty) return null;

	const { companyOwnsService, usersMayNotCopy } = config.intellectualProperty;

	const lines: string[] = [];

	if (companyOwnsService) {
		lines.push(
			`The services and all content, features, and functionality (including but not limited to text, graphics, logos, and software) are owned by ${config.company.legalName} and are protected by intellectual property laws.`,
		);
	}

	if (usersMayNotCopy) {
		lines.push(
			"You may not copy, modify, distribute, sell, or lease any part of our services or included software, nor may you reverse engineer or attempt to extract the source code of that software.",
		);
	}

	return {
		id: "tos-intellectual-property",
		title: "Intellectual Property",
		body: lines.join("\n\n"),
	};
}
