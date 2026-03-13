import type { CookiePolicyConfig, PolicySection } from "../../types";

export function buildJurisdiction(
	config: CookiePolicyConfig,
): PolicySection | null {
	if (!config.jurisdictions || config.jurisdictions.length === 0) return null;

	const requirements: string[] = [];

	if (config.jurisdictions.includes("eu")) {
		requirements.push(
			"**European Union (GDPR/ePrivacy Directive):** We comply with EU cookie consent requirements. Non-essential cookies require your prior, informed, and freely given consent. You have the right to withdraw consent at any time.",
		);
	}
	if (config.jurisdictions.includes("ca")) {
		requirements.push(
			"**California (CCPA):** California residents have the right to opt out of the sale of personal information collected through cookies. To exercise this right, please contact us.",
		);
	}
	if (config.jurisdictions.includes("us")) {
		requirements.push(
			"**United States:** We comply with applicable U.S. federal and state privacy laws regarding cookie usage and disclosure.",
		);
	}
	if (config.jurisdictions.includes("au")) {
		requirements.push(
			"**Australia (Privacy Act):** We comply with the Australian Privacy Principles regarding the collection of personal information through cookies.",
		);
	}
	if (config.jurisdictions.includes("nz")) {
		requirements.push(
			"**New Zealand (Privacy Act 2020):** We comply with New Zealand privacy requirements for the collection of personal information through cookies.",
		);
	}
	if (config.jurisdictions.includes("other")) {
		requirements.push(
			"**Other Jurisdictions:** We strive to comply with applicable cookie laws and regulations in all jurisdictions where we operate.",
		);
	}

	const list = requirements.map((r) => `- ${r}`).join("\n");

	return {
		id: "jurisdiction",
		title: "Legal Requirements",
		body: `Our cookie practices are designed to comply with applicable laws across the jurisdictions in which we operate:\n\n${list}`,
	};
}
