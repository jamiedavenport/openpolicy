import { afterEach, expect, test } from "bun:test";
import type { CookiePolicyConfig } from "@openpolicy/core";
import { getConsent } from "@openpolicy/core";
import {
	acceptAllForConfig,
	rejectAllForConfig,
	updateConsent,
} from "./useCookieConsent";

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
			const parts = v.split(";");
			const [kv] = parts;
			const [key, val] = kv!.split("=");
			if (val === "" || v.includes("max-age=0") || v.includes("Max-Age=0")) {
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

// --- acceptAllForConfig ---

test("acceptAllForConfig sets consent and returns accepted consent", () => {
	const consent = acceptAllForConfig(cookieConfig);
	expect(consent).toEqual({
		essential: true,
		analytics: true,
		functional: true,
		marketing: false,
	});
	expect(getConsent()).toEqual(consent);
});

// --- rejectAllForConfig ---

test("rejectAllForConfig sets all non-essential to false and persists", () => {
	const consent = rejectAllForConfig();
	expect(consent).toEqual({
		essential: true,
		analytics: false,
		functional: false,
		marketing: false,
	});
	expect(getConsent()).toEqual(consent);
});

// --- updateConsent ---

test("updateConsent merges partial consent with current and persists", () => {
	acceptAllForConfig(cookieConfig);
	const updated = updateConsent({ analytics: false });
	expect(updated).toEqual({
		essential: true,
		analytics: false,
		functional: true,
		marketing: false,
	});
	expect(getConsent()).toEqual(updated);
});

test("updateConsent creates consent from rejectAll baseline when none exists", () => {
	const updated = updateConsent({ functional: true });
	expect(updated).toEqual({
		essential: true,
		analytics: false,
		functional: true,
		marketing: false,
	});
});

test("updateConsent cannot disable essential", () => {
	const updated = updateConsent({ essential: false as unknown as true });
	expect(updated.essential).toBe(true);
});
