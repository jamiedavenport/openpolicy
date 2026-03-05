import type { PolicySection, PrivacyPolicyConfig } from "../../types";

export function buildCcpaSupplement(
	config: PrivacyPolicyConfig,
): PolicySection | null {
	if (!config.jurisdictions.includes("ca")) return null;

	return {
		id: "ccpa-supplement",
		title: "California Privacy Rights (CCPA)",
		body: `This section applies to California residents under the California Consumer Privacy Act (CCPA) and the California Privacy Rights Act (CPRA).

**Categories of Personal Information Collected:** We collect the categories of personal information described in the "Information We Collect" section above.

**Your California Rights:**
- **Right to Know:** You may request information about the personal information we have collected about you, including the categories of sources, the business purpose for collection, and the categories of third parties with whom we share information.
- **Right to Delete:** You may request deletion of personal information we have collected from you, subject to certain exceptions.
- **Right to Opt-Out:** You may opt out of the sale or sharing of your personal information.
- **Right to Non-Discrimination:** We will not discriminate against you for exercising your California privacy rights.

To exercise your rights, contact us at ${config.company.contact}.`,
	};
}
