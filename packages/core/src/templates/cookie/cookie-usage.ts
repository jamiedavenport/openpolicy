import type { CookiePolicyConfig, PolicySection } from "../../types";

export function buildCookieUsage(config: CookiePolicyConfig): PolicySection {
	const purposes: string[] = [];

	if (config.cookies.essential) {
		purposes.push("Providing core website functionality and security");
		purposes.push("Remembering your session and authentication state");
	}
	if (config.cookies.analytics) {
		purposes.push("Measuring website traffic and usage patterns");
		purposes.push("Identifying which pages and features are most popular");
	}
	if (config.cookies.functional) {
		purposes.push("Saving your preferences and settings");
		purposes.push("Providing personalized content and features");
	}
	if (config.cookies.marketing) {
		purposes.push("Delivering targeted advertising");
		purposes.push("Tracking the effectiveness of our marketing campaigns");
	}

	const list = purposes.map((p) => `- ${p}`).join("\n");

	return {
		id: "cookie-usage",
		title: "How We Use Cookies",
		body: `${config.company.name} uses cookies to:\n\n${list}`,
	};
}
