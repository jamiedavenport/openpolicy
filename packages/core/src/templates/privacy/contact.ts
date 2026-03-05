import type { PolicySection, PrivacyPolicyConfig } from "../../types";

export function buildContact(config: PrivacyPolicyConfig): PolicySection {
	return {
		id: "contact",
		title: "Contact Us",
		body: `If you have questions or concerns about this Privacy Policy or our data practices, please contact us:

**${config.company.legalName}**
${config.company.address}

Email: ${config.company.contact}`,
	};
}
