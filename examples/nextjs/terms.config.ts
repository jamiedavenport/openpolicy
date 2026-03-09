import { defineTermsOfService } from "@openpolicy/sdk";

export default defineTermsOfService({
	effectiveDate: "2026-03-09",
	company: {
		name: "Your Company",
		legalName: "Your Company, Inc.",
		address: "123 Main St, City, State, ZIP",
		contact: "legal@yourcompany.com",
	},
	acceptance: {
		methods: ["using the service", "creating an account"],
	},
	eligibility: {
		minimumAge: 13,
	},
	accounts: {
		registrationRequired: false,
		userResponsibleForCredentials: true,
		companyCanTerminate: true,
	},
	prohibitedUses: [
		"Violating any applicable laws or regulations",
		"Infringing on intellectual property rights",
	],
	intellectualProperty: {
		companyOwnsService: true,
		usersMayNotCopy: true,
	},
	termination: {
		companyCanTerminate: true,
		userCanTerminate: true,
	},
	disclaimers: {
		serviceProvidedAsIs: true,
		noWarranties: true,
	},
	limitationOfLiability: {
		excludesIndirectDamages: true,
	},
	governingLaw: {
		jurisdiction: "Delaware, USA",
	},
	changesPolicy: {
		noticeMethod: "email or prominent notice on our website",
		noticePeriodDays: 30,
	},
});
