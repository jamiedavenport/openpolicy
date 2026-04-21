import type { ThirdPartyEntry } from "./analyse";

/**
 * Registry of known npm packages mapped to their ThirdPartyEntry metadata.
 * Multiple package names can point to the same service — deduplication by
 * `ThirdPartyEntry.name` is handled at merge time in the caller.
 */
export const KNOWN_PACKAGES: ReadonlyMap<string, ThirdPartyEntry> = new Map([
	[
		"stripe",
		{
			name: "Stripe",
			purpose: "Payment processing",
			policyUrl: "https://stripe.com/privacy",
		},
	],
	[
		"@stripe/stripe-js",
		{
			name: "Stripe",
			purpose: "Payment processing",
			policyUrl: "https://stripe.com/privacy",
		},
	],
	[
		"braintree",
		{
			name: "Braintree",
			purpose: "Payment processing",
			policyUrl:
				"https://www.braintreepayments.com/legal/braintree-privacy-policy",
		},
	],
	[
		"@braintree/browser-drop-in",
		{
			name: "Braintree",
			purpose: "Payment processing",
			policyUrl:
				"https://www.braintreepayments.com/legal/braintree-privacy-policy",
		},
	],
	[
		"@sentry/browser",
		{
			name: "Sentry",
			purpose: "Error tracking",
			policyUrl: "https://sentry.io/privacy/",
		},
	],
	[
		"@sentry/node",
		{
			name: "Sentry",
			purpose: "Error tracking",
			policyUrl: "https://sentry.io/privacy/",
		},
	],
	[
		"@sentry/nextjs",
		{
			name: "Sentry",
			purpose: "Error tracking",
			policyUrl: "https://sentry.io/privacy/",
		},
	],
	[
		"@sentry/react",
		{
			name: "Sentry",
			purpose: "Error tracking",
			policyUrl: "https://sentry.io/privacy/",
		},
	],
	[
		"@sentry/vue",
		{
			name: "Sentry",
			purpose: "Error tracking",
			policyUrl: "https://sentry.io/privacy/",
		},
	],
	[
		"@datadog/browser-rum",
		{
			name: "Datadog",
			purpose: "Monitoring",
			policyUrl: "https://www.datadoghq.com/legal/privacy/",
		},
	],
	[
		"dd-trace",
		{
			name: "Datadog",
			purpose: "Monitoring",
			policyUrl: "https://www.datadoghq.com/legal/privacy/",
		},
	],
	[
		"posthog-js",
		{
			name: "PostHog",
			purpose: "Product analytics",
			policyUrl: "https://posthog.com/privacy",
		},
	],
	[
		"posthog-node",
		{
			name: "PostHog",
			purpose: "Product analytics",
			policyUrl: "https://posthog.com/privacy",
		},
	],
	[
		"mixpanel-browser",
		{
			name: "Mixpanel",
			purpose: "Product analytics",
			policyUrl: "https://mixpanel.com/legal/privacy-policy/",
		},
	],
	[
		"@segment/analytics-next",
		{
			name: "Segment",
			purpose: "Customer data platform",
			policyUrl: "https://www.twilio.com/en-us/legal/privacy",
		},
	],
	[
		"@amplitude/analytics-browser",
		{
			name: "Amplitude",
			purpose: "Product analytics",
			policyUrl: "https://amplitude.com/privacy",
		},
	],
	[
		"amplitude-js",
		{
			name: "Amplitude",
			purpose: "Product analytics",
			policyUrl: "https://amplitude.com/privacy",
		},
	],
	[
		"@vercel/analytics",
		{
			name: "Vercel Analytics",
			purpose: "Web analytics",
			policyUrl: "https://vercel.com/legal/privacy-policy",
		},
	],
	[
		"plausible-tracker",
		{
			name: "Plausible",
			purpose: "Web analytics",
			policyUrl: "https://plausible.io/privacy",
		},
	],
	[
		"logrocket",
		{
			name: "LogRocket",
			purpose: "Session recording",
			policyUrl: "https://logrocket.com/privacy/",
		},
	],
	[
		"@hotjar/browser",
		{
			name: "Hotjar",
			purpose: "Session recording",
			policyUrl: "https://www.hotjar.com/legal/policies/privacy/",
		},
	],
	[
		"resend",
		{
			name: "Resend",
			purpose: "Transactional email",
			policyUrl: "https://resend.com/legal/privacy-policy",
		},
	],
	[
		"@sendgrid/mail",
		{
			name: "SendGrid",
			purpose: "Transactional email",
			policyUrl: "https://www.twilio.com/en-us/legal/privacy",
		},
	],
	[
		"intercom-client",
		{
			name: "Intercom",
			purpose: "Customer messaging",
			policyUrl: "https://www.intercom.com/legal/privacy",
		},
	],
	[
		"@intercom/messenger-js-sdk",
		{
			name: "Intercom",
			purpose: "Customer messaging",
			policyUrl: "https://www.intercom.com/legal/privacy",
		},
	],
]);
