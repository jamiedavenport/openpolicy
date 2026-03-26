import { afterEach, expect, test } from "bun:test";
import {
	acceptAll,
	type CookieConsent,
	clearConsent,
	getConsent,
	hasConsented,
	rejectAll,
	resolveStatus,
	setConsent,
} from "./consent";
import type { CookiePolicyConfig } from "./types";

const cookieConfig: CookiePolicyConfig = {
	effectiveDate: "2026-01-01",
	company: {
		name: "Acme",
		legalName: "Acme Inc.",
		address: "123 Main St",
		contact: "privacy@acme.com",
	},
	cookies: {
		essential: true,
		analytics: true,
		functional: true,
		marketing: false,
	},
	jurisdictions: ["us"],
};

// Stub document.cookie for Node/Bun environment
let cookieJar = "";
Object.defineProperty(globalThis, "document", {
	value: {
		get cookie() {
			return cookieJar;
		},
		set cookie(v: string) {
			// Simple cookie jar: parse set-cookie and store key=value
			const parts = v.split(";");
			const [kv] = parts;
			const [key, val] = kv!.split("=");
			if (val === "" || v.includes("max-age=0") || v.includes("Max-Age=0")) {
				// Delete cookie
				const pairs = cookieJar
					.split("; ")
					.filter((p) => !p.startsWith(`${key}=`));
				cookieJar = pairs.join("; ");
			} else {
				const pairs = cookieJar
					.split("; ")
					.filter((p) => p && !p.startsWith(`${key}=`));
				pairs.push(kv!);
				cookieJar = pairs.join("; ");
			}
		},
	},
	writable: true,
	configurable: true,
});

afterEach(() => {
	cookieJar = "";
});

// --- getConsent ---

test("getConsent returns null when no consent cookie exists", () => {
	expect(getConsent()).toBeNull();
});

test("getConsent returns stored consent", () => {
	const consent: CookieConsent = {
		essential: true,
		analytics: true,
		functional: false,
		marketing: false,
	};
	setConsent(consent);
	expect(getConsent()).toEqual(consent);
});

test("getConsent returns null for malformed cookie", () => {
	cookieJar = "op_consent=not-valid-json";
	expect(getConsent()).toBeNull();
});

// --- setConsent ---

test("setConsent persists consent to cookie", () => {
	const consent: CookieConsent = {
		essential: true,
		analytics: false,
		functional: true,
		marketing: false,
	};
	setConsent(consent);
	expect(cookieJar).toContain("op_consent=");
	expect(getConsent()).toEqual(consent);
});

test("setConsent always forces essential to true", () => {
	setConsent({
		essential: false as unknown as true,
		analytics: false,
		functional: false,
		marketing: false,
	});
	expect(getConsent()!.essential).toBe(true);
});

// --- clearConsent ---

test("clearConsent removes the consent cookie", () => {
	setConsent({
		essential: true,
		analytics: true,
		functional: false,
		marketing: false,
	});
	expect(getConsent()).not.toBeNull();
	clearConsent();
	expect(getConsent()).toBeNull();
});

// --- hasConsented ---

test("hasConsented returns false when no consent stored", () => {
	expect(hasConsented()).toBe(false);
});

test("hasConsented returns true after setConsent", () => {
	setConsent({
		essential: true,
		analytics: false,
		functional: false,
		marketing: false,
	});
	expect(hasConsented()).toBe(true);
});

test("hasConsented returns false after clearConsent", () => {
	setConsent({
		essential: true,
		analytics: false,
		functional: false,
		marketing: false,
	});
	clearConsent();
	expect(hasConsented()).toBe(false);
});

// --- acceptAll ---

test("acceptAll enables all categories declared in config", () => {
	const consent = acceptAll(cookieConfig);
	expect(consent).toEqual({
		essential: true,
		analytics: true,
		functional: true,
		marketing: false,
	});
});

test("acceptAll only enables categories that are true in config.cookies", () => {
	const config = {
		...cookieConfig,
		cookies: {
			essential: true,
			analytics: true,
			functional: false,
			marketing: false,
		},
	};
	const consent = acceptAll(config);
	expect(consent.analytics).toBe(true);
	expect(consent.functional).toBe(false);
	expect(consent.marketing).toBe(false);
});

// --- rejectAll ---

test("rejectAll disables all non-essential categories", () => {
	const consent = rejectAll();
	expect(consent).toEqual({
		essential: true,
		analytics: false,
		functional: false,
		marketing: false,
	});
});

// --- resolveStatus ---

test("resolveStatus returns undecided when consent is null", () => {
	expect(resolveStatus(null, cookieConfig)).toBe("undecided");
});

test("resolveStatus returns accepted when all config categories are accepted", () => {
	const consent = acceptAll(cookieConfig);
	expect(resolveStatus(consent, cookieConfig)).toBe("accepted");
});

test("resolveStatus returns rejected when all non-essential are false", () => {
	const consent = rejectAll();
	// config has analytics+functional enabled, but consent rejects all
	const config = {
		...cookieConfig,
		cookies: {
			essential: true,
			analytics: true,
			functional: true,
			marketing: false,
		},
	};
	expect(resolveStatus(consent, config)).toBe("rejected");
});

test("resolveStatus returns custom when consent partially matches", () => {
	const consent: CookieConsent = {
		essential: true,
		analytics: true,
		functional: false,
		marketing: false,
	};
	// config has both analytics + functional, but user only accepted analytics
	expect(resolveStatus(consent, cookieConfig)).toBe("custom");
});
