# Known Packages Registry

These npm package names are auto-detected when `usePackageJson: true` is set in `autoCollect()`. The plugin reads `dependencies` and `devDependencies` from the project root `package.json` and matches entries against this registry. Multiple package names can map to the same service — deduplication is by service name, first match wins.

| npm package | Service name | Purpose |
|---|---|---|
| `stripe` | Stripe | Payment processing |
| `@stripe/stripe-js` | Stripe | Payment processing |
| `braintree` | Braintree | Payment processing |
| `@braintree/browser-drop-in` | Braintree | Payment processing |
| `@sentry/browser` | Sentry | Error tracking |
| `@sentry/node` | Sentry | Error tracking |
| `@sentry/nextjs` | Sentry | Error tracking |
| `@sentry/react` | Sentry | Error tracking |
| `@sentry/vue` | Sentry | Error tracking |
| `@datadog/browser-rum` | Datadog | Monitoring |
| `dd-trace` | Datadog | Monitoring |
| `posthog-js` | PostHog | Product analytics |
| `posthog-node` | PostHog | Product analytics |
| `mixpanel-browser` | Mixpanel | Product analytics |
| `@segment/analytics-next` | Segment | Customer data platform |
| `@amplitude/analytics-browser` | Amplitude | Product analytics |
| `amplitude-js` | Amplitude | Product analytics |
| `@vercel/analytics` | Vercel Analytics | Web analytics |
| `plausible-tracker` | Plausible | Web analytics |
| `logrocket` | LogRocket | Session recording |
| `@hotjar/browser` | Hotjar | Session recording |
| `resend` | Resend | Transactional email |
| `@sendgrid/mail` | SendGrid | Transactional email |
| `intercom-client` | Intercom | Customer messaging |
| `@intercom/messenger-js-sdk` | Intercom | Customer messaging |

## Services not in the registry

For services not listed here, use `thirdParty()` source annotations or the `Providers` preset constants from `@openpolicy/sdk`. See the main skill file for examples.

The registry source is at `packages/vite-auto-collect/src/known-packages.ts`.
