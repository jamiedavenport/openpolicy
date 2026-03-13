import type { CookiePolicyConfig, PolicySection } from "../../types";

export function buildThirdPartyCookies(
	config: CookiePolicyConfig,
): PolicySection | null {
	if (!config.thirdParties || config.thirdParties.length === 0) return null;

	const rows = config.thirdParties
		.map((tp) => {
			const policyLink = tp.policyUrl
				? ` ([Privacy Policy](${tp.policyUrl}))`
				: "";
			return `- **${tp.name}** — ${tp.purpose}${policyLink}`;
		})
		.join("\n");

	return {
		id: "third-party-cookies",
		title: "Third-Party Cookies",
		body: `Some cookies on our site are placed by third-party services. These third parties may use cookies to collect information about your online activities across different websites. We do not control these third-party cookies.

The following third parties may set cookies through our service:\n\n${rows}\n\nWe encourage you to review the privacy policies of these third parties to understand their data practices.`,
	};
}
