import type { PolicySection, TermsOfServiceConfig } from "../../types";

export function buildThirdPartyServices(
	config: TermsOfServiceConfig,
): PolicySection | null {
	if (!config.thirdPartyServices || config.thirdPartyServices.length === 0)
		return null;

	const list = config.thirdPartyServices
		.map((s) => `- **${s.name}** — ${s.purpose}`)
		.join("\n");

	return {
		id: "tos-third-party-services",
		title: "Third-Party Services",
		body: `Our services may integrate with or link to third-party services. Your use of those services is governed by their own terms and policies.\n\n${list}`,
	};
}
