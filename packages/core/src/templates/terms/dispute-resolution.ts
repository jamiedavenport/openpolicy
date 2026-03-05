import type { PolicySection, TermsOfServiceConfig } from "../../types";

export function buildDisputeResolution(
	config: TermsOfServiceConfig,
): PolicySection | null {
	if (!config.disputeResolution) return null;

	const { method, venue, classActionWaiver } = config.disputeResolution;

	const methodDescriptions: Record<string, string> = {
		arbitration:
			"Any disputes arising out of or relating to these Terms or our services shall be resolved by binding arbitration rather than in court.",
		litigation:
			"Any disputes arising out of or relating to these Terms or our services shall be resolved through litigation in a court of competent jurisdiction.",
		mediation:
			"Any disputes arising out of or relating to these Terms or our services shall first be submitted to non-binding mediation before pursuing other remedies.",
	};

	const lines: string[] = [
		methodDescriptions[method] ??
			"Disputes arising out of or relating to these Terms shall be resolved as described below.",
	];

	if (venue) {
		lines.push(`**Venue:** ${venue}`);
	}

	if (classActionWaiver) {
		lines.push(
			"**Class Action Waiver:** You agree that any dispute resolution proceedings will be conducted only on an individual basis and not in a class, consolidated, or representative action.",
		);
	}

	return {
		id: "tos-dispute-resolution",
		title: "Dispute Resolution",
		body: lines.join("\n\n"),
	};
}
