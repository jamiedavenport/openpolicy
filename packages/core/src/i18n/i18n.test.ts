import { expect, test } from "vite-plus/test";
import { compile } from "../documents";
import type { Locale, PolicyInput } from "../types";
import { en } from "./en";
import { formatDate } from "./format";
import { fr } from "./fr";
import { createT, dictionaries, isLocale, LOCALES } from "./index";

test("createT returns the English dictionary for 'en'", () => {
	const t = createT("en");
	expect(t.privacy.introduction.heading()).toBe("Introduction");
	expect(t.cookie.introduction.heading()).toBe("Cookie Policy");
});

test("createT falls back to English for an unknown locale", () => {
	const t = createT("xx" as Locale);
	expect(t.privacy.introduction.heading()).toBe("Introduction");
});

test("isLocale accepts registered locales and rejects others", () => {
	expect(isLocale("en")).toBe(true);
	expect(isLocale("fr")).toBe(true);
	expect(isLocale("de")).toBe(false);
	expect(isLocale("")).toBe(false);
	expect(isLocale(undefined)).toBe(false);
	expect(isLocale(123)).toBe(false);
});

test("LOCALES contains every key in dictionaries", () => {
	const dictKeys = Object.keys(dictionaries).sort();
	const localeKeys = [...LOCALES].sort();
	expect(dictKeys).toEqual(localeKeys);
});

test("interpolation works in template-function values", () => {
	const t = createT("en");
	const body = t.privacy.introduction.body({
		companyName: "Acme",
		effectiveDate: "2026-01-01",
		versionSuffix: " Version: abc123.",
	});
	expect(body).toContain("Acme");
	expect(body).toContain("2026-01-01");
	expect(body).toContain("Version: abc123.");
});

test("formatDate renders English long-form dates", () => {
	expect(formatDate("2026-01-01", "en")).toBe("January 1, 2026");
	expect(formatDate("2026-03-03", "en")).toBe("March 3, 2026");
});

test("formatDate renders French long-form dates", () => {
	expect(formatDate("2026-01-01", "fr")).toBe("1 janvier 2026");
	expect(formatDate("2026-03-03", "fr")).toBe("3 mars 2026");
});

test("formatDate is timezone-independent (UTC pinning)", () => {
	// Without timeZone: "UTC", a US-West runtime would shift 2026-01-01
	// to 2025-12-31 because new Date("2026-01-01") parses as midnight UTC,
	// then Intl renders it in the runtime's local TZ. Pinning to UTC fixes this.
	expect(formatDate("2026-01-01", "en")).toBe("January 1, 2026");
	expect(formatDate("2026-01-01", "fr")).toBe("1 janvier 2026");
});

test("legal basis labels cover every member of the LegalBasis union", () => {
	const t = createT("en");
	expect(t.shared.legalBasisLabels.consent()).toBe("Consent (Article 6(1)(a))");
	expect(t.shared.legalBasisLabels.contract()).toBe("Performance of a contract (Article 6(1)(b))");
	expect(t.shared.legalBasisLabels.legal_obligation()).toBe(
		"Compliance with a legal obligation (Article 6(1)(c))",
	);
	expect(t.shared.legalBasisLabels.vital_interests()).toBe(
		"Protection of vital interests (Article 6(1)(d))",
	);
	expect(t.shared.legalBasisLabels.public_task()).toBe(
		"Performance of a public task (Article 6(1)(e))",
	);
	expect(t.shared.legalBasisLabels.legitimate_interests()).toBe(
		"Legitimate interests (Article 6(1)(f))",
	);
});

test("dictionary keys are stable references on en", () => {
	// Smoke test that the dictionary object itself is well-formed —
	// every top-level namespace exists.
	expect(en.shared).toBeDefined();
	expect(en.privacy).toBeDefined();
	expect(en.cookie).toBeDefined();
});

test("French dictionary headings are translated", () => {
	const t = createT("fr");
	expect(t.privacy.introduction.heading()).toBe("Introduction");
	expect(t.privacy.dataCollected.heading()).toBe("Données que nous collectons");
	expect(t.privacy.userRights.heading()).toBe("Vos droits");
	expect(t.privacy.gdprSupplement.heading()).toBe("Informations complémentaires RGPD");
	expect(t.cookie.introduction.heading()).toBe("Politique relative aux cookies");
	expect(t.cookie.whatAreCookies.heading()).toBe("Qu'est-ce qu'un cookie ?");
});

test("French legal basis labels use RGPD article references", () => {
	const t = createT("fr");
	expect(t.shared.legalBasisLabels.consent()).toContain("Consentement");
	expect(t.shared.legalBasisLabels.consent()).toContain("article 6, paragraphe 1, point a)");
	expect(t.shared.legalBasisLabels.contract()).toContain("Exécution d'un contrat");
	expect(t.shared.legalBasisLabels.legitimate_interests()).toContain("Intérêts légitimes");
});

function leafPaths(obj: unknown, prefix = ""): string[] {
	if (typeof obj === "function") return [prefix];
	if (obj === null || typeof obj !== "object") return [];
	return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) =>
		leafPaths(v, prefix ? `${prefix}.${k}` : k),
	);
}

test("French dictionary covers every key in English (structural completeness)", () => {
	const enPaths = leafPaths(en).sort();
	const frPaths = leafPaths(fr).sort();
	expect(frPaths).toEqual(enPaths);
});

const minimalFrPrivacyInput: PolicyInput = {
	type: "privacy",
	effectiveDate: "2026-01-01",
	locale: "fr",
	company: {
		name: "Acme",
		legalName: "Acme SAS",
		address: "1 rue de la Paix, 75002 Paris, France",
		contact: { email: "privacy@acme.fr" },
	},
	data: {
		collected: { "Informations de compte": ["E-mail", "Nom"] },
		context: {
			"Informations de compte": {
				purpose: "Authentifier les utilisateurs",
				lawfulBasis: "contract",
				retention: "Jusqu'à la suppression du compte",
				provision: {
					basis: "contract-prerequisite",
					consequences: "Nous ne pouvons pas créer ni opérer votre compte.",
				},
			},
		},
	},
	cookies: {
		used: { essential: true },
		context: { essential: { lawfulBasis: "legal_obligation" } },
	},
	thirdParties: [],
	userRights: ["access", "rectification", "erasure"],
	jurisdictions: ["eu"],
};

test("French privacy document compiles with no English leakage in OP-emitted strings", () => {
	const doc = compile(minimalFrPrivacyInput);
	const blob = JSON.stringify(doc);

	// Distinctly-English phrases that would only appear if a section builder
	// fell back to English or the dictionary registration missed a key.
	const englishCanaries = [
		"Effective Date:",
		"Information We Collect",
		"Your Rights",
		"GDPR Supplemental Disclosures",
		"Data Controller:",
		"Right to access your personal data",
		"Performance of a contract",
		"Cookies and Tracking",
		"Submitting requests.",
	];
	for (const phrase of englishCanaries) {
		expect(blob).not.toContain(phrase);
	}

	// French phrases that prove translation flowed through end-to-end.
	expect(blob).toContain("Date d'entrée en vigueur");
	expect(blob).toContain("Données que nous collectons");
	expect(blob).toContain("Vos droits");
	expect(blob).toContain("Informations complémentaires RGPD");
	expect(blob).toContain("Responsable du traitement");
	expect(blob).toContain("1 janvier 2026"); // formatDate output
});
