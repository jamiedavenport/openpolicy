import { expect, test } from "bun:test";
import { compileTermsOfService } from "./terms";
import type { TermsOfServiceConfig } from "./types";

const baseConfig: TermsOfServiceConfig = {
	effectiveDate: "2026-03-03",
	company: {
		name: "Acme",
		legalName: "Acme Corp",
		address: "123 Main St",
		contact: "legal@acme.com",
	},
	acceptance: { methods: ["using the service"] },
	governingLaw: { jurisdiction: "Delaware, USA" },
};

test("always-present sections: introduction, acceptance, governing-law, contact", () => {
	const results = compileTermsOfService(baseConfig);
	const { sections, content } = results[0]!;

	const ids = sections.map((s) => s.id);
	expect(ids).toContain("tos-introduction");
	expect(ids).toContain("tos-acceptance");
	expect(ids).toContain("tos-governing-law");
	expect(ids).toContain("tos-contact");
	expect(content).toContain("Acme");
	expect(content).toContain("Delaware, USA");
});

test("optional sections absent when config fields missing", () => {
	const results = compileTermsOfService(baseConfig);
	const ids = results[0]!.sections.map((s) => s.id);

	expect(ids).not.toContain("tos-eligibility");
	expect(ids).not.toContain("tos-accounts");
	expect(ids).not.toContain("tos-prohibited-use");
	expect(ids).not.toContain("tos-user-content");
	expect(ids).not.toContain("tos-intellectual-property");
	expect(ids).not.toContain("tos-payments");
	expect(ids).not.toContain("tos-availability");
	expect(ids).not.toContain("tos-termination");
	expect(ids).not.toContain("tos-disclaimers");
	expect(ids).not.toContain("tos-limitation-of-liability");
	expect(ids).not.toContain("tos-indemnification");
	expect(ids).not.toContain("tos-third-party-services");
	expect(ids).not.toContain("tos-dispute-resolution");
	expect(ids).not.toContain("tos-changes");
});

test("eligibility section present when config.eligibility provided", () => {
	const config: TermsOfServiceConfig = {
		...baseConfig,
		eligibility: { minimumAge: 18, jurisdictionRestrictions: ["Cuba", "Iran"] },
	};
	const results = compileTermsOfService(config);
	const ids = results[0]!.sections.map((s) => s.id);
	expect(ids).toContain("tos-eligibility");
	expect(results[0]!.content).toContain("18 years old");
	expect(results[0]!.content).toContain("Cuba");
});

test("payments section absent when hasPaidFeatures is false", () => {
	const config: TermsOfServiceConfig = {
		...baseConfig,
		payments: { hasPaidFeatures: false, refundPolicy: "No refunds" },
	};
	const results = compileTermsOfService(config);
	const ids = results[0]!.sections.map((s) => s.id);
	expect(ids).not.toContain("tos-payments");
});

test("payments section present when hasPaidFeatures is true", () => {
	const config: TermsOfServiceConfig = {
		...baseConfig,
		payments: {
			hasPaidFeatures: true,
			refundPolicy: "30-day money-back guarantee",
			priceChangesNotice: "30 days notice via email",
		},
	};
	const results = compileTermsOfService(config);
	const ids = results[0]!.sections.map((s) => s.id);
	expect(ids).toContain("tos-payments");
	expect(results[0]!.content).toContain("30-day money-back guarantee");
});

test("third-party-services section absent when array is empty", () => {
	const config: TermsOfServiceConfig = {
		...baseConfig,
		thirdPartyServices: [],
	};
	const results = compileTermsOfService(config);
	const ids = results[0]!.sections.map((s) => s.id);
	expect(ids).not.toContain("tos-third-party-services");
});

test("third-party-services section present when services listed", () => {
	const config: TermsOfServiceConfig = {
		...baseConfig,
		thirdPartyServices: [{ name: "Stripe", purpose: "Payment processing" }],
	};
	const results = compileTermsOfService(config);
	const ids = results[0]!.sections.map((s) => s.id);
	expect(ids).toContain("tos-third-party-services");
	expect(results[0]!.content).toContain("Stripe");
});

test("full config renders all sections", () => {
	const config: TermsOfServiceConfig = {
		...baseConfig,
		eligibility: { minimumAge: 13 },
		accounts: {
			registrationRequired: true,
			userResponsibleForCredentials: true,
			companyCanTerminate: true,
		},
		prohibitedUses: ["Illegal activities"],
		userContent: {
			usersOwnContent: true,
			licenseGrantedToCompany: true,
			companyCanRemoveContent: true,
		},
		intellectualProperty: { companyOwnsService: true, usersMayNotCopy: true },
		payments: { hasPaidFeatures: true },
		availability: { noUptimeGuarantee: true },
		termination: { companyCanTerminate: true, userCanTerminate: true },
		disclaimers: { serviceProvidedAsIs: true, noWarranties: true },
		limitationOfLiability: { excludesIndirectDamages: true },
		indemnification: { userIndemnifiesCompany: true },
		thirdPartyServices: [{ name: "Analytics Co", purpose: "Analytics" }],
		disputeResolution: { method: "arbitration", classActionWaiver: true },
		changesPolicy: { noticeMethod: "email", noticePeriodDays: 30 },
		privacyPolicyUrl: "https://acme.com/privacy",
	};
	const results = compileTermsOfService(config);
	const ids = results[0]!.sections.map((s) => s.id);

	expect(ids).toContain("tos-eligibility");
	expect(ids).toContain("tos-accounts");
	expect(ids).toContain("tos-prohibited-use");
	expect(ids).toContain("tos-user-content");
	expect(ids).toContain("tos-intellectual-property");
	expect(ids).toContain("tos-payments");
	expect(ids).toContain("tos-availability");
	expect(ids).toContain("tos-termination");
	expect(ids).toContain("tos-disclaimers");
	expect(ids).toContain("tos-limitation-of-liability");
	expect(ids).toContain("tos-indemnification");
	expect(ids).toContain("tos-third-party-services");
	expect(ids).toContain("tos-dispute-resolution");
	expect(ids).toContain("tos-changes");
});

test("pdf format throws not yet implemented", () => {
	expect(() => compileTermsOfService(baseConfig, { formats: ["pdf"] })).toThrow(
		"pdf format is not yet implemented",
	);
});

test("compilePolicy routes terms input", () => {
	const { compilePolicy } = require("./index");
	const results = compilePolicy({ type: "terms", ...baseConfig });
	expect(results[0]?.format).toBe("markdown");
	expect(results[0]?.content).toContain("Terms of Service");
});
