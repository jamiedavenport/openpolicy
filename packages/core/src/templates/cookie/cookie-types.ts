import type { CookiePolicyConfig, PolicySection } from "../../types";

export function buildCookieTypes(config: CookiePolicyConfig): PolicySection {
	const types: string[] = [];

	if (config.cookies.essential) {
		types.push(
			"**Essential Cookies** — These cookies are necessary for our website to function and cannot be switched off. They are usually set in response to actions you take, such as setting your privacy preferences, logging in, or filling in forms.",
		);
	}
	if (config.cookies.analytics) {
		types.push(
			"**Analytics Cookies** — These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us understand which pages are most and least popular and see how visitors move around the site.",
		);
	}
	if (config.cookies.functional) {
		types.push(
			"**Functional Cookies** — These cookies enable enhanced functionality and personalization, such as remembering your preferences and settings. They may be set by us or by third-party providers whose services we have added to our pages.",
		);
	}
	if (config.cookies.marketing) {
		types.push(
			"**Marketing Cookies** — These cookies may be set through our site by our advertising partners. They may be used to build a profile of your interests and show you relevant advertisements on other sites.",
		);
	}

	const list = types.map((t) => `- ${t}`).join("\n");

	return {
		id: "cookie-types",
		title: "Types of Cookies We Use",
		body: `We use the following categories of cookies:\n\n${list}`,
	};
}
