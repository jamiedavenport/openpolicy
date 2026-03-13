import type { CookiePolicyConfig, PolicySection } from "../../types";

export function buildManagingCookies(
	_config: CookiePolicyConfig,
): PolicySection {
	return {
		id: "managing-cookies",
		title: "Managing Your Cookie Preferences",
		body: `You can control and manage cookies in several ways:

**Browser settings:** Most browsers allow you to refuse cookies or delete existing ones. The process varies by browser:
- **Chrome:** Settings → Privacy and security → Cookies and other site data
- **Firefox:** Settings → Privacy & Security → Cookies and Site Data
- **Safari:** Preferences → Privacy → Manage Website Data
- **Edge:** Settings → Cookies and site permissions

**Opt-out tools:** For analytics and advertising cookies, you may use industry opt-out tools such as the [NAI opt-out](http://optout.networkadvertising.org/) or [DAA opt-out](http://optout.aboutads.info/).

Please note that blocking or deleting cookies may affect your experience on our website, and some features may not function correctly if cookies are disabled.`,
	};
}
