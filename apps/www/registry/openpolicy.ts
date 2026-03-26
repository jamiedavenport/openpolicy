import { defineConfig } from "@openpolicy/sdk";

export default defineConfig({
	company: {
		name: "Your Company",
		legalName: "Your Company, Inc.",
		address: "123 Main St, City, State, ZIP",
		contact: "privacy@yourcompany.com",
	},
	privacy: {
		effectiveDate: "2025-01-01",
		dataCollected: {
			"Personal Information": ["Full name", "Email address"],
			"Usage Data": ["Pages visited", "Time spent on site"],
		},
		legalBasis: "Legitimate interests and consent",
		retention: {
			"Personal data": "As long as your account is active",
		},
		cookies: {
			essential: true,
			analytics: false,
			marketing: false,
		},
		thirdParties: [],
		userRights: ["access", "erasure", "portability"],
		jurisdictions: ["us"],
	},
	terms: {
		effectiveDate: "2025-01-01",
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
	},
});
