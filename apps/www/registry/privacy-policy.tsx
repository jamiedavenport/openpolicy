import { PrivacyPolicy as PrivacyPolicyBase } from "@openpolicy/react";
import type { OpenPolicyConfig, PrivacyPolicyConfig } from "@openpolicy/sdk";
import {
	PolicyHeading,
	PolicyLink,
	PolicyList,
	PolicyParagraph,
	PolicySection,
} from "@/components/ui/openpolicy/policy-components";

interface PrivacyPolicyProps {
	config?: OpenPolicyConfig | PrivacyPolicyConfig;
}

export function PrivacyPolicy({ config }: PrivacyPolicyProps) {
	return (
		<PrivacyPolicyBase
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
