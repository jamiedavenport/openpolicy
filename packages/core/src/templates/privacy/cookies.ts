import type { PolicySection, PrivacyPolicyConfig } from "../../types";

export function buildCookies(config: PrivacyPolicyConfig): PolicySection {
	const enabled: string[] = [];
	if (config.cookies.essential)
		enabled.push(
			"**Essential cookies** — required for the service to function",
		);
	if (config.cookies.analytics)
		enabled.push(
			"**Analytics cookies** — help us understand how visitors interact with our service",
		);
	if (config.cookies.marketing)
		enabled.push(
			"**Marketing cookies** — used to deliver relevant advertisements",
		);

	const body =
		enabled.length > 0
			? `We use the following types of cookies and tracking technologies:\n\n${enabled.map((e) => `- ${e}`).join("\n")}`
			: "We do not use cookies or tracking technologies on our service.";

	return {
		id: "cookies",
		title: "Cookies and Tracking",
		body,
	};
}
