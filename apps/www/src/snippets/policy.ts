import { defineConfig } from "@openpolicy/sdk";

export default defineConfig({
	company: {
		name: "Acme Inc.",
		legalName: "Acme Incorporated",
		address: "123 Market St, San Francisco, CA 94105",
		contact: "privacy@acme.com",
	},
	privacy: {
		effectiveDate: "2026-01-01",
		dataCollected: {
			account: ["email", "name", "password"],
			usage: ["ip_address", "browser", "pages_visited"],
			payment: ["billing_address", "last_4_digits"],
		},
		legalBasis: "legitimate_interest",
		retention: {
			account: "3 years after account closure",
			logs: "90 days",
		},
		cookies: { essential: true, analytics: true, marketing: false },
		thirdParties: [
			{ name: "Stripe", purpose: "payment processing" },
			{ name: "PostHog", purpose: "product analytics" },
		],
		userRights: ["access", "rectification", "erasure", "portability"],
		jurisdictions: ["us", "eu"],
	},
	terms: {
		effectiveDate: "2026-01-01",
		acceptance: { methods: ["using the service", "creating an account"] },
		governingLaw: { jurisdiction: "Delaware, USA" },
	},
});
