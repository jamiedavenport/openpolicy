import type { CookiePolicyConfig, PolicySection } from "../../types";

export function buildTrackingTechnologies(
	config: CookiePolicyConfig,
): PolicySection | null {
	if (!config.trackingTechnologies || config.trackingTechnologies.length === 0)
		return null;

	const list = config.trackingTechnologies.map((t) => `- ${t}`).join("\n");

	return {
		id: "tracking-technologies",
		title: "Similar Tracking Technologies",
		body: `In addition to cookies, we may use the following tracking technologies:\n\n${list}\n\nThese technologies work similarly to cookies and are subject to the same controls described in this policy.`,
	};
}
