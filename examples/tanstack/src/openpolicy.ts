import { dataCollected, defineConfig, thirdParties } from "@openpolicy/sdk";

export default defineConfig({
	company: {
		name: "Acme Inc.",
		legalName: "Acme Corporation",
		address: "123 Main St, Springfield, USA",
		contact: "privacy@acme.com",
	},
	privacy: {
		effectiveDate: "2026-03-03",
		dataCollected: {
			...dataCollected,
			// Static entries are still allowed alongside scanned ones:
			"Usage Data": ["Pages visited", "Browser type", "IP address"],
		},
		legalBasis: "legitimate_interests",
		retention: {
			"Account data": "Until account deletion",
			"Usage logs": "90 days",
		},
		cookies: {
			essential: true,
			analytics: false,
			marketing: false,
		},
		thirdParties,
		userRights: ["access", "erasure"],
		jurisdictions: ["us", "eu"],
		children: { underAge: 16, noticeUrl: "https://acme.com/parental-notice" },
	},
	cookie: {
		effectiveDate: "2026-03-03",
		cookies: {
			essential: true,
			analytics: true,
			functional: false,
			marketing: false,
		},
		thirdParties,
		trackingTechnologies: ["web beacons", "local storage"],
		consentMechanism: {
			hasBanner: true,
			hasPreferencePanel: true,
			canWithdraw: true,
		},
		jurisdictions: ["us", "eu"],
	},
});
