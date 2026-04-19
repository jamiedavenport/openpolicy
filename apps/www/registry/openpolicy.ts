import { defineConfig } from "@openpolicy/sdk";

export default defineConfig({
	company: {
		name: "Your Company",
		legalName: "Your Company, Inc.",
		address: "123 Main St, City, State, ZIP",
		contact: "privacy@yourcompany.com",
	},
	effectiveDate: "2026-01-01",
	jurisdictions: ["us", "eu"],
	dataCollected: {
		"Personal Information": ["Full name", "Email address"],
		"Usage Data": ["Pages visited", "Time spent on site"],
	},
	legalBasis: ["legitimate_interests", "consent"],
	retention: {
		"Personal data": "As long as your account is active",
	},
	cookies: {
		essential: true,
		analytics: false,
		marketing: false,
	},
	thirdParties: [],
});
