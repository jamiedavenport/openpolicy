import { expect, test } from "bun:test";
import type { TermsOfServiceConfig } from "./types";
import { validateTermsOfService } from "./validate-terms";

const validConfig: TermsOfServiceConfig = {
	effectiveDate: "2026-03-03",
	company: {
		name: "Acme",
		legalName: "Acme Corp",
		address: "123 Main St",
		contact: "legal@acme.com",
	},
	acceptance: { methods: ["using the service"] },
	governingLaw: { jurisdiction: "Delaware, USA" },
	disclaimers: { serviceProvidedAsIs: true, noWarranties: true },
	limitationOfLiability: { excludesIndirectDamages: true },
};

test("valid config produces no issues", () => {
	const issues = validateTermsOfService(validConfig);
	expect(issues).toHaveLength(0);
});

test("missing effectiveDate produces error", () => {
	const config: TermsOfServiceConfig = {
		...validConfig,
		effectiveDate: "",
	};
	const issues = validateTermsOfService(config);
	expect(
		issues.some(
			(i) => i.level === "error" && i.message.includes("effectiveDate"),
		),
	).toBe(true);
});

test("missing company.name produces error", () => {
	const config: TermsOfServiceConfig = {
		...validConfig,
		company: { ...validConfig.company, name: "" },
	};
	const issues = validateTermsOfService(config);
	expect(
		issues.some(
			(i) => i.level === "error" && i.message.includes("company.name"),
		),
	).toBe(true);
});

test("missing company.legalName produces error", () => {
	const config: TermsOfServiceConfig = {
		...validConfig,
		company: { ...validConfig.company, legalName: "" },
	};
	const issues = validateTermsOfService(config);
	expect(
		issues.some(
			(i) => i.level === "error" && i.message.includes("company.legalName"),
		),
	).toBe(true);
});

test("missing company.address produces error", () => {
	const config: TermsOfServiceConfig = {
		...validConfig,
		company: { ...validConfig.company, address: "" },
	};
	const issues = validateTermsOfService(config);
	expect(
		issues.some(
			(i) => i.level === "error" && i.message.includes("company.address"),
		),
	).toBe(true);
});

test("missing company.contact produces error", () => {
	const config: TermsOfServiceConfig = {
		...validConfig,
		company: { ...validConfig.company, contact: "" },
	};
	const issues = validateTermsOfService(config);
	expect(
		issues.some(
			(i) => i.level === "error" && i.message.includes("company.contact"),
		),
	).toBe(true);
});

test("missing governingLaw.jurisdiction produces error", () => {
	const config: TermsOfServiceConfig = {
		...validConfig,
		governingLaw: { jurisdiction: "" },
	};
	const issues = validateTermsOfService(config);
	expect(
		issues.some(
			(i) =>
				i.level === "error" && i.message.includes("governingLaw.jurisdiction"),
		),
	).toBe(true);
});

test("missing disclaimers produces warning", () => {
	const { disclaimers: _, ...configWithoutDisclaimers } = validConfig;
	const issues = validateTermsOfService(
		configWithoutDisclaimers as TermsOfServiceConfig,
	);
	expect(
		issues.some(
			(i) => i.level === "warning" && i.message.includes("disclaimers"),
		),
	).toBe(true);
});

test("missing limitationOfLiability produces warning", () => {
	const { limitationOfLiability: _, ...configWithoutLol } = validConfig;
	const issues = validateTermsOfService(
		configWithoutLol as TermsOfServiceConfig,
	);
	expect(
		issues.some(
			(i) =>
				i.level === "warning" && i.message.includes("limitationOfLiability"),
		),
	).toBe(true);
});

test("empty acceptance.methods produces warning", () => {
	const config: TermsOfServiceConfig = {
		...validConfig,
		acceptance: { methods: [] },
	};
	const issues = validateTermsOfService(config);
	expect(
		issues.some(
			(i) => i.level === "warning" && i.message.includes("acceptance.methods"),
		),
	).toBe(true);
});
