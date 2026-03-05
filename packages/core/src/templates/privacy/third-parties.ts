import type { PolicySection, PrivacyPolicyConfig } from "../../types";

export function buildThirdParties(config: PrivacyPolicyConfig): PolicySection {
	const lines = config.thirdParties.map(
		(tp) => `- **${tp.name}** — ${tp.purpose}`,
	);

	const body =
		lines.length > 0
			? `We share data with the following third-party services:\n\n${lines.join("\n")}`
			: "We do not share your data with third-party services.";

	return {
		id: "third-parties",
		title: "Third-Party Services",
		body,
	};
}
