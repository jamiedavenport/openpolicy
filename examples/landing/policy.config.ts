import { definePrivacyPolicy } from "@openpolicy/sdk";

export default definePrivacyPolicy({
	effectiveDate: "2026-03-03",
	company: {
		name: "Acme Inc.",
		legalName: "Acme Corporation",
		address: "123 Main St, Springfield, USA",
		contact: "privacy@acme.com",
	},
	dataCollected: {
		"Account Information": ["Name", "Email address"],
		"Usage Data": ["Pages visited", "Browser type", "IP address"],
	},
	legalBasis: "Legitimate interests and consent",
	retention: {
		"Account data": "Until account deletion",
		"Usage logs": "90 days",
	},
	cookies: {
		essential: true,
		analytics: false,
		marketing: false,
	},
	thirdParties: [],
	userRights: ["access", "erasure"],
	jurisdictions: ["us", "eu"],
	children: { underAge: 16, noticeUrl: "https://acme.com/parental-notice" },
});
