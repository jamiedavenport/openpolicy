import { defineConfig } from "@openpolicy/sdk";

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
	},
	legalBasis: {
		"Providing the service": "legitimate_interests",
		"Marketing communications": "consent",
	},
	retention: {
		"Account information": "Until account deletion",
		"Session data": "Until session expiry",
	},
	cookies: {
		essential: true,
		analytics: false,
		marketing: false,
	},
	thirdParties: [],
});
