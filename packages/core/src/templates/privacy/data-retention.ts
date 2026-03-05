import type { PolicySection, PrivacyPolicyConfig } from "../../types";

export function buildDataRetention(config: PrivacyPolicyConfig): PolicySection {
	const entries = Object.entries(config.retention);
	const lines = entries.map(
		([category, period]) => `- **${category}:** ${period}`,
	);

	return {
		id: "data-retention",
		title: "Data Retention",
		body: `We retain your information for the following periods:\n\n${lines.join("\n")}`,
	};
}
