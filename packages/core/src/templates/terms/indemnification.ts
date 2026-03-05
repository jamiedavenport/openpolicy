import type { PolicySection, TermsOfServiceConfig } from "../../types";

export function buildIndemnification(
	config: TermsOfServiceConfig,
): PolicySection | null {
	if (!config.indemnification) return null;

	const lines: string[] = [];

	if (config.indemnification.userIndemnifiesCompany) {
		lines.push(
			`You agree to indemnify and hold harmless ${config.company.legalName} and its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses arising out of or in any way connected with your access to or use of our services.`,
		);
	}

	if (config.indemnification.scope) {
		lines.push(`**Scope:** ${config.indemnification.scope}`);
	}

	return {
		id: "tos-indemnification",
		title: "Indemnification",
		body: lines.join("\n\n"),
	};
}
