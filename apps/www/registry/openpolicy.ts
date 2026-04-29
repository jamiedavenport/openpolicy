import { ContractPrerequisite, defineConfig, LegalBases, Voluntary } from "@openpolicy/sdk";

export default defineConfig({
	company: {
		name: "Your Company",
		legalName: "Your Company, Inc.",
		address: "123 Main St, City, State, ZIP",
		contact: { email: "privacy@yourcompany.com" },
	},
	effectiveDate: "2026-01-01",
	jurisdictions: ["eu", "us-ca"],
	data: {
		collected: {
			"Personal Information": ["Full name", "Email address"],
			"Usage Data": ["Pages visited", "Time spent on site"],
		},
		context: {
			"Personal Information": {
				purpose: "To create and manage user accounts",
				lawfulBasis: LegalBases.Contract,
				retention: "As long as your account is active",
				provision: ContractPrerequisite("We cannot create or manage your account."),
			},
			"Usage Data": {
				purpose: "To understand product usage and improve the service",
				lawfulBasis: LegalBases.LegitimateInterests,
				retention: "90 days",
				provision: Voluntary("None — your service is unaffected."),
			},
		},
	},
	cookies: {
		used: {
			essential: true,
			analytics: false,
			marketing: false,
		},
		context: {
			essential: { lawfulBasis: LegalBases.LegalObligation },
			analytics: { lawfulBasis: LegalBases.Consent },
			marketing: { lawfulBasis: LegalBases.Consent },
		},
	},
	thirdParties: [],
	automatedDecisionMaking: [],
});
