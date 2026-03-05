import type { PolicySection, PrivacyPolicyConfig } from "../../types";

export function buildIntroduction(config: PrivacyPolicyConfig): PolicySection {
	return {
		id: "introduction",
		title: "Introduction",
		body: `This Privacy Policy describes how ${config.company.name} ("we", "us", or "our") collects, uses, and shares information about you when you use our services.

**Effective Date:** ${config.effectiveDate}

If you have questions about this policy, please contact us at ${config.company.contact}.`,
	};
}
