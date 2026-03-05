import type { PolicySection, TermsOfServiceConfig } from "../../types";

export function buildGoverningLaw(config: TermsOfServiceConfig): PolicySection {
	return {
		id: "tos-governing-law",
		title: "Governing Law",
		body: `These Terms shall be governed by and construed in accordance with the laws of **${config.governingLaw.jurisdiction}**, without regard to its conflict of law provisions.`,
	};
}
