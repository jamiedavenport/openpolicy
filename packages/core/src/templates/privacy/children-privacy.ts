import type { PolicySection, PrivacyPolicyConfig } from "../../types";

export function buildChildrenPrivacy(
	config: PrivacyPolicyConfig,
): PolicySection | null {
	if (!config.children) return null;
	const { underAge, noticeUrl } = config.children;
	let body = `Our service is not directed at children under ${underAge} years old.`;
	if (noticeUrl) {
		body += ` See our notice for parents and guardians: ${noticeUrl}`;
	}
	return {
		id: "children-privacy",
		title: "Children’s Privacy",
		body,
	};
}
