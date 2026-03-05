import type { PolicySection, TermsOfServiceConfig } from "../../types";

export function buildAcceptance(config: TermsOfServiceConfig): PolicySection {
	const methodList = config.acceptance.methods.map((m) => `- ${m}`).join("\n");

	return {
		id: "tos-acceptance",
		title: "Acceptance of Terms",
		body: `By accessing or using our services, you agree to be bound by these Terms. You accept these Terms by:\n\n${methodList}\n\nIf you do not agree to these Terms, you may not use our services.`,
	};
}
