import type { PolicySection, PrivacyPolicyConfig } from "../../types";

export function buildGdprSupplement(
	config: PrivacyPolicyConfig,
): PolicySection | null {
	if (!config.jurisdictions.includes("eu")) return null;

	return {
		id: "gdpr-supplement",
		title: "GDPR Supplemental Disclosures",
		body: `This section applies to individuals in the European Economic Area (EEA) under the General Data Protection Regulation (GDPR).

**Data Controller:** ${config.company.legalName}, ${config.company.address}

**Your GDPR Rights:** In addition to the rights listed above, you have the right to lodge a complaint with your local data protection authority if you believe we have not handled your data in accordance with applicable law.

**International Transfers:** If we transfer your personal data outside the EEA, we ensure adequate safeguards are in place in accordance with GDPR requirements.`,
	};
}
