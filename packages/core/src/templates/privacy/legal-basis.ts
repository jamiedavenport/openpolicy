import type { PolicySection, PrivacyPolicyConfig } from "../../types";

export function buildLegalBasis(
	config: PrivacyPolicyConfig,
): PolicySection | null {
	if (!config.jurisdictions.includes("eu")) return null;

	return {
		id: "legal-basis",
		title: "Legal Basis for Processing",
		body: `We process your personal data under the following legal basis:\n\n${config.legalBasis}`,
	};
}
