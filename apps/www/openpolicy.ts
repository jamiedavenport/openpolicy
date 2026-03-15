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
	terms: {
		effectiveDate: "2026-03-05",
		acceptance: {
			methods: ["using the service", "registering for early access"],
		},
		eligibility: {
			minimumAge: 18,
		},
		prohibitedUses: [
			"Violating any applicable laws or regulations",
			"Infringing on intellectual property rights",
			"Attempting to reverse-engineer or decompile the service",
			"Using the service to generate policies for illegal purposes",
		],
		intellectualProperty: {
			companyOwnsService: true,
			usersMayNotCopy: true,
		},
		termination: {
			companyCanTerminate: true,
			userCanTerminate: true,
			effectOfTermination: "Access to the service will be revoked immediately",
		},
		disclaimers: {
			serviceProvidedAsIs: true,
			noWarranties: true,
		},
		limitationOfLiability: {
			excludesIndirectDamages: true,
		},
		indemnification: {
			userIndemnifiesCompany: true,
			scope:
				"claims arising from your use of the service or violation of these terms",
		},
		governingLaw: {
			jurisdiction: "England and Wales",
		},
		changesPolicy: {
			noticeMethod: "prominent notice on our website",
			noticePeriodDays: 14,
		},
		privacyPolicyUrl: "https://openpolicy.sh/privacy",
	},
});
