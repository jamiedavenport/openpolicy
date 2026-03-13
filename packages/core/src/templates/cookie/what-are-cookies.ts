import type { CookiePolicyConfig, PolicySection } from "../../types";

export function buildWhatAreCookies(
	_config: CookiePolicyConfig,
): PolicySection {
	return {
		id: "what-are-cookies",
		title: "What Are Cookies",
		body: `Cookies are small text files that are placed on your device (computer, tablet, or mobile phone) when you visit a website. They are widely used to make websites work, or work more efficiently, and to provide information to the website owner.

Cookies are set by the website you visit (first-party cookies) or by third parties whose content appears on that page (third-party cookies). Cookies remain on your device for varying lengths of time depending on their type.`,
	};
}
