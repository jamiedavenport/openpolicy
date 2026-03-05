import type { PolicySection, TermsOfServiceConfig } from "../../types";

export function buildEligibility(
	config: TermsOfServiceConfig,
): PolicySection | null {
	if (!config.eligibility) return null;

	const { minimumAge, jurisdictionRestrictions } = config.eligibility;

	let body = `You must be at least **${minimumAge} years old** to use our services. By using our services, you represent and warrant that you meet this age requirement.`;

	if (jurisdictionRestrictions && jurisdictionRestrictions.length > 0) {
		const list = jurisdictionRestrictions.map((r) => `- ${r}`).join("\n");
		body += `\n\nOur services are not available in the following jurisdictions:\n\n${list}`;
	}

	return {
		id: "tos-eligibility",
		title: "Eligibility",
		body,
	};
}
