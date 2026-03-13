import { defineConfig } from "@openpolicy/sdk";

export default defineConfig({
	company: {
		name: "OpenPolicy",
		legalName: "JXD Ltd",
		address: "86-90 Paul Street, London, EC2A 4NE, United Kingdom",
		contact: "jamie@jxd.dev",
	},
	privacy: {
		effectiveDate: "2026-03-03",
		dataCollected: {
			"Account Information": ["Name", "Email address"],
			"Session Data": ["IP address", "User agent"],
		},
		legalBasis: "Legitimate interests and consent",
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
		userRights: ["access", "erasure", "portability"],
		jurisdictions: ["us", "eu"],
	},
});
