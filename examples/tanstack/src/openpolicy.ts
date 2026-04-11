import { dataCollected, defineConfig } from "@openpolicy/sdk";

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
		thirdParties: [],
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
		jurisdictions: ["us", "eu"],
	},
	terms: {
		effectiveDate: "2026-03-03",
		acceptance: {
			methods: [
				"using the service",
				"creating an account",
				"clicking 'I Agree'",
			],
		},
		eligibility: {
			minimumAge: 13,
		},
		accounts: {
			registrationRequired: false,
			userResponsibleForCredentials: true,
			companyCanTerminate: true,
		},
		prohibitedUses: [
			"Violating any applicable laws or regulations",
			"Infringing on the intellectual property rights of others",
			"Transmitting spam, malware, or other harmful content",
			"Attempting to gain unauthorized access to our systems",
		],
		intellectualProperty: {
			companyOwnsService: true,
			usersMayNotCopy: true,
		},
		termination: {
			companyCanTerminate: true,
			userCanTerminate: true,
			effectOfTermination:
				"Upon termination, your right to use the services ceases immediately.",
		},
		disclaimers: {
			serviceProvidedAsIs: true,
			noWarranties: true,
		},
		limitationOfLiability: {
			excludesIndirectDamages: true,
			liabilityCap:
				"Our total liability shall not exceed the greater of $100 or the amount you paid us in the past twelve months.",
		},
		governingLaw: {
			jurisdiction: "Delaware, USA",
		},
		changesPolicy: {
			noticeMethod: "email or prominent notice on our website",
			noticePeriodDays: 30,
		},
		privacyPolicyUrl: "/privacy",
	},
});
