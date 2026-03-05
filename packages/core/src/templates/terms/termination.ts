import type { PolicySection, TermsOfServiceConfig } from "../../types";

export function buildTermination(
	config: TermsOfServiceConfig,
): PolicySection | null {
	if (!config.termination) return null;

	const { companyCanTerminate, userCanTerminate, effectOfTermination } =
		config.termination;

	const lines: string[] = [];

	if (companyCanTerminate) {
		lines.push(
			`${config.company.name} may suspend or terminate your access to the services at any time, with or without cause, and with or without notice.`,
		);
	}

	if (userCanTerminate) {
		lines.push(
			"You may terminate your account at any time by discontinuing use of our services or by contacting us to close your account.",
		);
	}

	if (effectOfTermination) {
		lines.push(`**Effect of Termination:** ${effectOfTermination}`);
	}

	return {
		id: "tos-termination",
		title: "Termination",
		body: lines.join("\n\n"),
	};
}
