import type { PolicySection, TermsOfServiceConfig } from "../../types";

export function buildProhibitedUse(
	config: TermsOfServiceConfig,
): PolicySection | null {
	if (!config.prohibitedUses || config.prohibitedUses.length === 0) return null;

	const list = config.prohibitedUses.map((u) => `- ${u}`).join("\n");

	return {
		id: "tos-prohibited-use",
		title: "Prohibited Uses",
		body: `You agree not to use our services for any of the following purposes:\n\n${list}`,
	};
}
