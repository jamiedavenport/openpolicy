import {
	cookies,
	dataCollected,
	defineConfig,
	thirdParties,
} from "@openpolicy/sdk";

export default defineConfig({
	company: {
		name: "Acme Inc.",
		legalName: "Acme Corporation",
		address: "123 Main St, Springfield, USA",
		contact: "privacy@acme.com",
	},
	effectiveDate: "2026-03-03",
	jurisdictions: ["us", "eu"],
	dataCollected: {
		...dataCollected,
		"Usage Data": ["Pages visited", "Browser type", "IP address"],
	},
	legalBasis: "legitimate_interests",
	retention: {
		"Account data": "Until account deletion",
		"Usage logs": "90 days",
	},
	cookies,
	thirdParties,
	trackingTechnologies: ["web beacons", "local storage"],
	consentMechanism: {
		hasBanner: true,
		hasPreferencePanel: true,
		canWithdraw: true,
	},
	children: { underAge: 16, noticeUrl: "https://acme.com/parental-notice" },
});
