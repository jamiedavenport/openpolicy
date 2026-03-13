import type { CookiePolicyConfig, PolicySection } from "../../types";

export function buildContact(config: CookiePolicyConfig): PolicySection {
	return {
		id: "contact",
		title: "Contact Us",
		body: `If you have any questions about our use of cookies or this Cookie Policy, please contact us:

**${config.company.legalName}**
${config.company.address}
${config.company.contact}`,
	};
}
