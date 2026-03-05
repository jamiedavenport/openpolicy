import type { PolicySection, TermsOfServiceConfig } from "../../types";

export function buildAccounts(
	config: TermsOfServiceConfig,
): PolicySection | null {
	if (!config.accounts) return null;

	const {
		registrationRequired,
		userResponsibleForCredentials,
		companyCanTerminate,
	} = config.accounts;

	const lines: string[] = [];

	if (registrationRequired) {
		lines.push(
			"You must create an account to access certain features of our services. You agree to provide accurate, current, and complete information during registration.",
		);
	}

	if (userResponsibleForCredentials) {
		lines.push(
			"You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.",
		);
	}

	if (companyCanTerminate) {
		lines.push(
			`${config.company.name} reserves the right to suspend or terminate your account at any time, with or without notice, for any reason including violation of these Terms.`,
		);
	}

	return {
		id: "tos-accounts",
		title: "Accounts",
		body: lines.join("\n\n"),
	};
}
