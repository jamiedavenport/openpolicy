import { TermsOfService as TermsOfServiceBase } from "@openpolicy/react";
import type { OpenPolicyConfig, TermsOfServiceConfig } from "@openpolicy/sdk";
import {
	PolicyHeading,
	PolicyLink,
	PolicyList,
	PolicyParagraph,
	PolicySection,
} from "@/components/ui/openpolicy/policy-components";

interface TermsOfServiceProps {
	config?: OpenPolicyConfig | TermsOfServiceConfig;
}

export function TermsOfService({ config }: TermsOfServiceProps) {
	return (
		<TermsOfServiceBase
			config={config}
			components={{
				Section: PolicySection,
				Heading: PolicyHeading,
				Paragraph: PolicyParagraph,
				List: PolicyList,
				Link: PolicyLink,
			}}
		/>
	);
}
