import type { CookiePolicyConfig } from "./types";

const COOKIE_NAME = "op_consent";
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year in seconds

export type CookieConsent = {
	essential: true;
	[key: string]: boolean;
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
	const encoded = match.split("=").slice(1).join("=");
	if (!encoded) return null;
	try {
		return JSON.parse(decodeURIComponent(encoded)) as CookieConsent;
	} catch {
		return null;
	}
}

export function setConsent(consent: CookieConsent): void {
	const value: CookieConsent = { ...consent, essential: true };
	// biome-ignore lint/suspicious/noDocumentCookie: this write must be synchronous so consent is available immediately after user action.
	document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(value))}; max-age=${COOKIE_MAX_AGE}; path=/; SameSite=Lax`;
}

export function clearConsent(): void {
	// biome-ignore lint/suspicious/noDocumentCookie: this clear must be synchronous so banner visibility updates immediately.
	document.cookie = `${COOKIE_NAME}=; max-age=0; path=/; SameSite=Lax`;
}

export function hasConsented(): boolean {
	return getConsent() !== null;
}

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
