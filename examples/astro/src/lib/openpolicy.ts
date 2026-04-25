import { ContractPrerequisite, defineConfig, LegalBases } from "@openpolicy/sdk";

export default defineConfig({
	company: {
		name: "Acme Inc.",
		legalName: "Acme Corporation",
		address: "123 Main St, Springfield, USA",
		contact: "privacy@acme.com",
	},
	effectiveDate: "2026-03-03",
	jurisdictions: ["eu", "us-ca"],
	data: {
		collected: {
			"Account Information": ["Name", "Email address"],
			"Usage Data": ["Pages visited", "Browser type", "IP address"],
		},
		context: {
			"Account Information": {
				purpose: "To authenticate users and send service notifications",
				lawfulBasis: LegalBases.Contract,
				retention: "Until account deletion",
				provision: ContractPrerequisite("We cannot create or operate your account."),
			},
			"Usage Data": {
				purpose: "To understand product usage and improve the service",
				lawfulBasis: LegalBases.LegitimateInterests,
				retention: "90 days",
				provision: ContractPrerequisite("We cannot deliver or secure the service."),
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
	children: { underAge: 16, noticeUrl: "https://acme.com/parental-notice" },
	automatedDecisionMaking: [],
});
