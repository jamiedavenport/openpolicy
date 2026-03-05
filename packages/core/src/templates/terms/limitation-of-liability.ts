import type { PolicySection, TermsOfServiceConfig } from "../../types";

export function buildLimitationOfLiability(
	config: TermsOfServiceConfig,
): PolicySection | null {
	if (!config.limitationOfLiability) return null;

	const lines: string[] = [];

	if (config.limitationOfLiability.excludesIndirectDamages) {
		lines.push(
			`TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, ${config.company.legalName.toUpperCase()} SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.`,
		);
	}

	if (config.limitationOfLiability.liabilityCap) {
		lines.push(
			`**Liability Cap:** ${config.limitationOfLiability.liabilityCap}`,
		);
	}

	return {
		id: "tos-limitation-of-liability",
		title: "Limitation of Liability",
		body: lines.join("\n\n"),
	};
}
