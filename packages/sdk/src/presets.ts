/**
 * Optional authoring presets — plain `as const` data, no logic. Spread or
 * reference them in a `policystack.ts`; they are also enumerated by
 * `renderLlmsTxt()` / `renderSkillPack()` and back the PS-29 MCP payload, so
 * their *contents* are byte-pinned by `llms.test.ts` / `skills.test.ts`.
 */
import type { JurisdictionId, LegalBasis } from "@policystack/core";

export const DataCategories = {
	AccountInfo: { "Account Information": ["Name", "Email address"] },
	SessionData: {
		"Session Data": ["IP address", "User agent", "Browser type"],
	},
	PaymentInfo: {
		"Payment Information": ["Card last 4 digits", "Billing name", "Billing address"],
	},
	UsageData: {
		"Usage Data": ["Pages visited", "Features used", "Time spent"],
	},
	DeviceInfo: {
		"Device Information": ["Device type", "Operating system", "Browser version"],
	},
	LocationData: { "Location Data": ["Country", "City", "Timezone"] },
	Communications: {
		Communications: ["Email content", "Support tickets"],
	},
} as const;

export const Retention = {
	UntilAccountDeletion: "Until account deletion",
	UntilSessionExpiry: "Until session expiry",
	ThirtyDays: "30 days",
	NinetyDays: "90 days",
	OneYear: "1 year",
	ThreeYears: "3 years",
	AsRequiredByLaw: "As required by applicable law",
} as const;

export const LegalBases = {
	Consent: "consent",
	Contract: "contract",
	LegalObligation: "legal_obligation",
	VitalInterests: "vital_interests",
	PublicTask: "public_task",
	LegitimateInterests: "legitimate_interests",
} as const satisfies Record<string, LegalBasis>;

type Provider = { name: string; purpose: string; policyUrl?: string };

export const Providers = {
	// Payments
	Stripe: {
		name: "Stripe",
		purpose: "Payment processing",
		policyUrl: "https://stripe.com/privacy",
	},
	Paddle: {
		name: "Paddle",
		purpose: "Payment processing and subscription management",
		policyUrl: "https://www.paddle.com/legal/privacy",
	},
	LemonSqueezy: {
		name: "Lemon Squeezy",
		purpose: "Payment processing and subscription management",
		policyUrl: "https://www.lemonsqueezy.com/privacy",
	},
	PayPal: {
		name: "PayPal",
		purpose: "Payment processing",
		policyUrl: "https://www.paypal.com/webapps/mpp/ua/privacy-full",
	},

	// Analytics
	GoogleAnalytics: {
		name: "Google Analytics",
		purpose: "Usage analytics",
		policyUrl: "https://policies.google.com/privacy",
	},
	PostHog: {
		name: "PostHog",
		purpose: "Product analytics and session recording",
		policyUrl: "https://posthog.com/privacy",
	},
	Plausible: {
		name: "Plausible Analytics",
		purpose: "Privacy-friendly usage analytics",
		policyUrl: "https://plausible.io/privacy",
	},
	Mixpanel: {
		name: "Mixpanel",
		purpose: "Product analytics and event tracking",
		policyUrl: "https://mixpanel.com/legal/privacy-policy",
	},

	// Infrastructure
	Vercel: {
		name: "Vercel",
		purpose: "Hosting and deployment infrastructure",
		policyUrl: "https://vercel.com/legal/privacy-policy",
	},
	Cloudflare: {
		name: "Cloudflare",
		purpose: "CDN, DNS, and security services",
		policyUrl: "https://www.cloudflare.com/privacypolicy/",
	},
	AWS: {
		name: "Amazon Web Services",
		purpose: "Cloud infrastructure and hosting",
		policyUrl: "https://aws.amazon.com/privacy/",
	},

	// Auth
	Auth0: {
		name: "Auth0",
		purpose: "Authentication and identity management",
		policyUrl: "https://auth0.com/privacy",
	},
	Clerk: {
		name: "Clerk",
		purpose: "Authentication and user management",
		policyUrl: "https://clerk.com/privacy",
	},

	// Email
	Resend: {
		name: "Resend",
		purpose: "Transactional email delivery",
		policyUrl: "https://resend.com/legal/privacy-policy",
	},
	Postmark: {
		name: "Postmark",
		purpose: "Transactional email delivery",
		policyUrl: "https://wildbit.com/privacy-policy",
	},
	SendGrid: {
		name: "SendGrid",
		purpose: "Transactional email delivery",
		policyUrl: "https://www.twilio.com/en-us/legal/privacy",
	},
	Loops: {
		name: "Loops",
		purpose: "Email marketing and automation",
		policyUrl: "https://loops.so/privacy",
	},

	// Monitoring
	Sentry: {
		name: "Sentry",
		purpose: "Error monitoring and performance tracking",
		policyUrl: "https://sentry.io/privacy/",
	},
	Datadog: {
		name: "Datadog",
		purpose: "Infrastructure monitoring and observability",
		policyUrl: "https://www.datadoghq.com/legal/privacy/",
	},
} satisfies Record<string, Provider>;

export const Compliance = {
	GDPR: {
		jurisdictions: ["eea"] as JurisdictionId[],
	},
	UK_GDPR: {
		jurisdictions: ["uk"] as JurisdictionId[],
	},
	CCPA: {
		jurisdictions: ["us-ca"] as JurisdictionId[],
	},
} as const;
