import { defineConfig } from "@openpolicy/sdk";

export default defineConfig({
	company: {
		name: "Your Company",
		legalName: "Your Company, Inc.",
		address: "123 Main St, City, State, ZIP",
		contact: "privacy@yourcompany.com",
	},
	privacy: {
		effectiveDate: "2026-03-06",
		dataCollected: {
			"Personal Information": ["Full name", "Email address"],
		},
		legalBasis: "Legitimate interests and consent",
		retention: {
			"All personal data":
				"As long as necessary for the purposes described in this policy",
		},
		cookies: { essential: true, analytics: false, marketing: false },
		thirdParties: [],
		userRights: ["access", "erasure"],
		jurisdictions: ["us"],
	},
});
