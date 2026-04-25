import { defineConfig, LegalBases } from "@openpolicy/sdk";

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
		purposes: {
			"Account Information":
				"To authenticate users, send service notifications, and provide customer support",
			"Session Data": "To secure sessions, detect abuse, and diagnose service issues",
		},
		lawfulBasis: {
			"Account Information": LegalBases.Contract,
			"Session Data": LegalBases.LegitimateInterests,
		},
		retention: {
			"Account Information": "Until account deletion",
			"Session Data": "Until session expiry",
		},
		provisionRequirement: {
			"Account Information": {
				basis: "contract-prerequisite",
				consequences: "We cannot create or operate your account.",
			},
			"Session Data": {
				basis: "contract-prerequisite",
				consequences: "We cannot secure the service or your session.",
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
