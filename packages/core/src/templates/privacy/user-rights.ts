import type { PolicySection, PrivacyPolicyConfig } from "../../types";

const RIGHTS_LABELS: Record<string, string> = {
	access: "Right to access your personal data",
	rectification: "Right to correct inaccurate data",
	erasure: "Right to request deletion of your data",
	portability: "Right to receive your data in a portable format",
	restriction: "Right to restrict how we process your data",
	objection: "Right to object to processing",
	opt_out_sale: "Right to opt out of the sale of your personal information",
	non_discrimination:
		"Right to non-discriminatory treatment for exercising your rights",
};

export function buildUserRights(config: PrivacyPolicyConfig): PolicySection {
	const lines = config.userRights.map((right) => {
		const label = RIGHTS_LABELS[right] ?? right;
		return `- ${label}`;
	});

	return {
		id: "user-rights",
		title: "Your Rights",
		body: `You have the following rights regarding your personal data:\n\n${lines.join("\n")}`,
	};
}
