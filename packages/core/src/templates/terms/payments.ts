import type { PolicySection, TermsOfServiceConfig } from "../../types";

export function buildPayments(
	config: TermsOfServiceConfig,
): PolicySection | null {
	if (!config.payments || !config.payments.hasPaidFeatures) return null;

	const lines: string[] = [
		"Some features of our services require payment. By selecting a paid plan, you agree to pay all applicable fees.",
	];

	if (config.payments.refundPolicy) {
		lines.push(`**Refunds:** ${config.payments.refundPolicy}`);
	}

	if (config.payments.priceChangesNotice) {
		lines.push(`**Price Changes:** ${config.payments.priceChangesNotice}`);
	}

	return {
		id: "tos-payments",
		title: "Payments and Billing",
		body: lines.join("\n\n"),
	};
}
