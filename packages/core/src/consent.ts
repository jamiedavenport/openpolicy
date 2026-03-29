import type { CookiePolicyConfig } from "./types";

export type CookieConsent = {
	essential: true;
	[key: string]: boolean;
};

export type CookieConsentStatus =
	| "undecided"
	| "accepted"
	| "rejected"
	| "custom";

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

export function resolveStatus(
	consent: CookieConsent | null,
	config: CookiePolicyConfig,
): CookieConsentStatus {
	if (!consent) return "undecided";
	const accepted = acceptAll(config);
	const rejected = rejectAll(config);

	let matchesAccepted = true;
	let matchesRejected = true;

	for (const key of Object.keys(config.cookies)) {
		if (key === "essential") continue;
		const value = consent[key];
		if (value !== accepted[key]) matchesAccepted = false;
		if (value !== rejected[key]) matchesRejected = false;
	}

	if (matchesAccepted) return "accepted";
	if (matchesRejected) return "rejected";
	return "custom";
}
