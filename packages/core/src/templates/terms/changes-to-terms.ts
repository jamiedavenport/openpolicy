import type { PolicySection, TermsOfServiceConfig } from "../../types";

export function buildChangesToTerms(
	config: TermsOfServiceConfig,
): PolicySection | null {
	if (!config.changesPolicy) return null;

	const { noticeMethod, noticePeriodDays } = config.changesPolicy;

	const periodText = noticePeriodDays
		? ` at least **${noticePeriodDays} days** before they take effect`
		: " before they take effect";

	return {
		id: "tos-changes",
		title: "Changes to These Terms",
		body: `We may update these Terms from time to time. We will notify you of material changes via ${noticeMethod}${periodText}. Your continued use of our services after changes become effective constitutes your acceptance of the revised Terms.`,
	};
}
