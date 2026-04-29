import { ContractPrerequisite, defineConfig, LegalBases } from "@openpolicy/sdk";

export default defineConfig({
	company: {
		name: "Your Company",
		legalName: "Your Company, Inc.",
		address: "123 Main St, City, State, ZIP",
		contact: {
			email: "privacy@yourcompany.com",
			phone: "+1-800-555-0100",
		},
	},
	effectiveDate: "2026-03-09",
	jurisdictions: ["us-ca"],
	data: {
		collected: {
			"Personal Information": ["Full name", "Email address"],
		},
		context: {
			"Personal Information": {
				purpose: "To create and manage user accounts and provide customer support",
				lawfulBasis: LegalBases.Contract,
				retention: "As long as necessary for the purposes described in this policy",
				provision: ContractPrerequisite("We cannot create or manage your account."),
			},
		},
	},
	cookies: {
		used: {
			essential: true,
			analytics: true,
			functional: false,
			marketing: false,
		},
		context: {
			essential: { lawfulBasis: LegalBases.LegalObligation },
			analytics: { lawfulBasis: LegalBases.Consent },
			functional: { lawfulBasis: LegalBases.Consent },
			marketing: { lawfulBasis: LegalBases.Consent },
		},
	},
	thirdParties: [
		{
			name: "Google Analytics",
			purpose: "Website analytics and performance monitoring",
			policyUrl: "https://policies.google.com/privacy",
		},
	],
	trackingTechnologies: ["web beacons", "local storage"],
	consentMechanism: {
		hasBanner: true,
		hasPreferencePanel: true,
		canWithdraw: true,
	},
});
