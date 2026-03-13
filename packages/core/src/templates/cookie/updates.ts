import type { CookiePolicyConfig, PolicySection } from "../../types";

export function buildUpdates(config: CookiePolicyConfig): PolicySection {
	return {
		id: "updates",
		title: "Updates to This Policy",
		body: `We may update this Cookie Policy from time to time to reflect changes in our practices or applicable law. When we make changes, we will update the **Effective Date** at the top of this policy.

We encourage you to review this Cookie Policy periodically. Your continued use of our services after any changes constitutes your acceptance of the updated policy.

If you have questions about changes to this policy, please contact ${config.company.name} at ${config.company.contact}.`,
	};
}
