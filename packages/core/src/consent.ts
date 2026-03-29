import type { CookiePolicyConfig } from "./types";

export type CookieConsent = {
	essential: true;
	[key: string]: boolean;
};

export type CookieConsentStatus = "undecided" | "completed";

export function acceptAll(config: CookiePolicyConfig): CookieConsent {
	const consent: CookieConsent = { essential: true };
	for (const [key, value] of Object.entries(config.cookies)) {
		if (key === "essential") continue;
		consent[key] = Boolean(value);
	}
	return consent;
}

export function rejectAll(config?: CookiePolicyConfig): CookieConsent {
	const consent: CookieConsent = { essential: true };
	if (config) {
		for (const key of Object.keys(config.cookies)) {
			if (key === "essential") continue;
			consent[key] = false;
		}
	}
	return consent;
}
