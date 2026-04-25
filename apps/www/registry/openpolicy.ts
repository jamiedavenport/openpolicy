import { defineConfig, LegalBases } from "@openpolicy/sdk";

export default defineConfig({
	company: {
		name: "Your Company",
		legalName: "Your Company, Inc.",
		address: "123 Main St, City, State, ZIP",
		contact: "privacy@yourcompany.com",
	},
	effectiveDate: "2026-01-01",
	jurisdictions: ["eu", "us-ca"],
	data: {
		collected: {
			"Personal Information": ["Full name", "Email address"],
			"Usage Data": ["Pages visited", "Time spent on site"],
		},
		purposes: {
			"Personal Information": "To create and manage user accounts",
			"Usage Data": "To understand product usage and improve the service",
		},
		lawfulBasis: {
			"Personal Information": LegalBases.Contract,
			"Usage Data": LegalBases.LegitimateInterests,
		},
		retention: {
			"Personal Information": "As long as your account is active",
			"Usage Data": "90 days",
		},
		provisionRequirement: {
			"Personal Information": {
				basis: "contract-prerequisite",
				consequences: "We cannot create or manage your account.",
			},
			"Usage Data": {
				basis: "voluntary",
				consequences: "None — your service is unaffected.",
			},
		},
	},
	cookies: {
		used: {
			essential: true,
			analytics: false,
			marketing: false,
		},
		lawfulBasis: {
			essential: LegalBases.LegalObligation,
			analytics: LegalBases.Consent,
			marketing: LegalBases.Consent,
		},
	},
	thirdParties: [],
	automatedDecisionMaking: [],
});
