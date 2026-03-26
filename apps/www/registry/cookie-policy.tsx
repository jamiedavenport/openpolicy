import { CookiePolicy as CookiePolicyBase } from "@openpolicy/react";
import type { CookiePolicyConfig, OpenPolicyConfig } from "@openpolicy/sdk";
import {
	PolicyHeading,
	PolicyLink,
	PolicyList,
	PolicyParagraph,
	PolicySection,
} from "@/components/ui/openpolicy/policy-components";

interface CookiePolicyProps {
	config?: OpenPolicyConfig | CookiePolicyConfig;
}

export function CookiePolicy({ config }: CookiePolicyProps) {
	return (
		<CookiePolicyBase
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
