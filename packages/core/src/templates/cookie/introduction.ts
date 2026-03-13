import type { CookiePolicyConfig, PolicySection } from "../../types";

export function buildIntroduction(config: CookiePolicyConfig): PolicySection {
	return {
		id: "introduction",
		title: "Introduction",
		body: `This Cookie Policy explains how ${config.company.name} ("we", "us", or "our") uses cookies and similar tracking technologies when you visit our website or use our services.

**Effective Date:** ${config.effectiveDate}

By using our services, you consent to the use of cookies as described in this policy. If you have questions, please contact us at ${config.company.contact}.`,
	};
}
