import type { CookiePolicyConfig, PolicySection } from "../../types";

export function buildCookieDuration(
	_config: CookiePolicyConfig,
): PolicySection {
	return {
		id: "cookie-duration",
		title: "Cookie Duration",
		body: `Cookies can be either **session cookies** or **persistent cookies**:

- **Session cookies** are temporary and are deleted from your device when you close your browser. They are used to carry information across pages of our website and avoid having to re-enter information.
- **Persistent cookies** remain on your device for a set period of time specified in the cookie. They are activated each time you visit the website that created that particular cookie.

The specific duration of each cookie depends on its purpose and is determined at the time it is set.`,
	};
}
