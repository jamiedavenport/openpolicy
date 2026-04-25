import { defineConfig } from "@openpolicy/sdk";

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
		purposes: {
			"Account Information": "To authenticate users and send service notifications",
			"Usage Data": "To understand product usage and improve the service",
		},
	},
	legalBasis: {
		"Providing the service": "legitimate_interests",
		"Marketing communications": "consent",
	},
	retention: {
		"Account data": "Until account deletion",
		"Usage logs": "90 days",
	},
	cookies: {
		essential: true,
		analytics: true,
		functional: false,
		marketing: false,
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
