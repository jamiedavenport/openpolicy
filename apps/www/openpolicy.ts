import { ContractPrerequisite, defineConfig, LegalBases } from "@openpolicy/sdk";

export default defineConfig({
	company: {
		name: "OpenPolicy",
		legalName: "PolicyStack Ltd",
		address: "86-90 Paul Street, London, EC2A 4NE, United Kingdom",
		contact: "jamie@openpolicy.sh",
	},
	effectiveDate: "2026-03-03",
	jurisdictions: ["eu", "uk", "us-ca"],
	data: {
		collected: {
			"Account Information": ["Name", "Email address"],
			"Session Data": ["IP address", "User agent"],
		},
		context: {
			"Account Information": {
				purpose: "To authenticate users, send service notifications, and provide customer support",
				lawfulBasis: LegalBases.Contract,
				retention: "Until account deletion",
				provision: ContractPrerequisite("We cannot create or operate your account."),
			},
			"Session Data": {
				purpose: "To secure sessions, detect abuse, and diagnose service issues",
				lawfulBasis: LegalBases.LegitimateInterests,
				retention: "Until session expiry",
				provision: ContractPrerequisite("We cannot secure the service or your session."),
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
