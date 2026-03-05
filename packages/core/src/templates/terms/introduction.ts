import type { PolicySection, TermsOfServiceConfig } from "../../types";

export function buildIntroduction(config: TermsOfServiceConfig): PolicySection {
	const privacyLine = config.privacyPolicyUrl
		? `\n\nFor information about how we collect and use your data, please review our [Privacy Policy](${config.privacyPolicyUrl}).`
		: "";

	return {
		id: "tos-introduction",
		title: "Terms of Service",
		body: `These Terms of Service ("Terms") govern your access to and use of the services provided by ${config.company.name} ("${config.company.name}", "we", "us", or "our"). By using our services, you agree to these Terms.

**Effective Date:** ${config.effectiveDate}${privacyLine}`,
	};
}
