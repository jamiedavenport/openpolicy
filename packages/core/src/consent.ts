import type { CookiePolicyConfig } from "./types";

const COOKIE_NAME = "op_consent";
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year in seconds

export type CookieConsent = {
	essential: true;
	analytics: boolean;
	functional: boolean;
	marketing: boolean;
};

export type CookieConsentStatus =
	| "undecided"
	| "accepted"
	| "rejected"
	| "custom";

export function getConsent(): CookieConsent | null {
	const match = document.cookie
		.split("; ")
		.find((c) => c.startsWith(`${COOKIE_NAME}=`));
	if (!match) return null;
	try {
		return JSON.parse(decodeURIComponent(match.split("=")[1]!));
	} catch {
		return null;
	}
}

export function setConsent(consent: CookieConsent): void {
	const value: CookieConsent = { ...consent, essential: true };
	document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(value))}; max-age=${COOKIE_MAX_AGE}; path=/; SameSite=Lax`;
}

export function clearConsent(): void {
	document.cookie = `${COOKIE_NAME}=; max-age=0; path=/; SameSite=Lax`;
}

export function hasConsented(): boolean {
	return getConsent() !== null;
}

export function acceptAll(config: CookiePolicyConfig): CookieConsent {
	return {
		essential: true,
		analytics: config.cookies.analytics,
		functional: config.cookies.functional,
		marketing: config.cookies.marketing,
	};
}

export function rejectAll(): CookieConsent {
	return {
		essential: true,
		analytics: false,
		functional: false,
		marketing: false,
	};
}

export function resolveStatus(
	consent: CookieConsent | null,
	config: CookiePolicyConfig,
): CookieConsentStatus {
	if (!consent) return "undecided";
	const accepted = acceptAll(config);
	const rejected = rejectAll();
	if (
		consent.analytics === accepted.analytics &&
		consent.functional === accepted.functional &&
		consent.marketing === accepted.marketing
	)
		return "accepted";
	if (
		consent.analytics === rejected.analytics &&
		consent.functional === rejected.functional &&
		consent.marketing === rejected.marketing
	)
		return "rejected";
	return "custom";
}
