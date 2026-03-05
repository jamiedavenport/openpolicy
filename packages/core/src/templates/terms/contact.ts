import type { PolicySection, TermsOfServiceConfig } from "../../types";

export function buildContact(config: TermsOfServiceConfig): PolicySection {
	return {
		id: "tos-contact",
		title: "Contact Us",
		body: `If you have any questions about these Terms, please contact us at:

**${config.company.legalName}**
${config.company.address}
${config.company.contact}`,
	};
}
