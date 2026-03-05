import type { PolicySection, TermsOfServiceConfig } from "../../types";

export function buildUserContent(
	config: TermsOfServiceConfig,
): PolicySection | null {
	if (!config.userContent) return null;

	const {
		usersOwnContent,
		licenseGrantedToCompany,
		licenseDescription,
		companyCanRemoveContent,
	} = config.userContent;

	const lines: string[] = [];

	if (usersOwnContent) {
		lines.push(
			'You retain ownership of any content you submit, post, or display on or through our services ("User Content").',
		);
	}

	if (licenseGrantedToCompany) {
		const desc = licenseDescription
			? licenseDescription
			: "a worldwide, royalty-free, non-exclusive license to use, reproduce, modify, and distribute your User Content in connection with operating and improving our services";
		lines.push(
			`By submitting User Content, you grant ${config.company.name} ${desc}.`,
		);
	}

	if (companyCanRemoveContent) {
		lines.push(
			`${config.company.name} reserves the right to remove any User Content that violates these Terms or that we find objectionable, at our sole discretion.`,
		);
	}

	return {
		id: "tos-user-content",
		title: "User Content",
		body: lines.join("\n\n"),
	};
}
