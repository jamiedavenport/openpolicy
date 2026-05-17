// The canonical OpenPolicy config. One `defineConfig()` is the single source
// of truth: it generates the privacy + cookie policy documents AND derives the
// consent runtime (categories, gating, re-prompt) consumed by
// `<PolicyStackProvider>` in src/routes/__root.tsx. The only thing that differs
// per framework is that provider wiring — the config below is framework-neutral.
//
// `dataCollected`, `cookies` and `thirdParties` come from ./openpolicy.gen,
// which the `openPolicy()` Vite plugin generates by scanning the source. This
// file is also the project's scanner regression net — keep the scanned imports.
import { ContractPrerequisite, defineConfig, LegalBases } from "@openpolicy/sdk";
import { cookies, dataCollected, thirdParties } from "./openpolicy.gen";

export default defineConfig({
	// Your legal entity — printed verbatim in both policies.
	company: {
		name: "Acme Inc.",
		legalName: "Acme Corporation",
		address: "123 Main St, Springfield, USA",
		contact: { email: "privacy@acme.com" },
	},
	effectiveDate: "2026-03-03",
	// Jurisdictions served, as SDK codes — drives the disclosures rendered.
	jurisdictions: ["eea", "us-ca"],
	// Personal data: `collected` is the categories → fields map (scanned set
	// plus a manually declared one); `context` gives each category its purpose,
	// lawful basis and retention.
	data: {
		collected: {
			...dataCollected,
			"Usage Data": ["Pages visited", "Browser type", "IP address"],
		},
		context: {
			"Account Information": {
				purpose: "To authenticate users and send service notifications",
				lawfulBasis: LegalBases.Contract,
				retention: "Until account deletion",
				provision: ContractPrerequisite("We cannot create or operate your account."),
			},
			"Usage Data": {
				purpose: "To understand product usage and improve the service",
				lawfulBasis: LegalBases.LegitimateInterests,
				retention: "90 days",
				provision: ContractPrerequisite("We cannot deliver or secure the service."),
			},
		},
	},
	// Cookies: the consent runtime is DERIVED from this block. Each key in
	// `used` becomes a consent category; its `lawfulBasis` decides locked vs.
	// consent-gated (LegalObligation ⇒ always on; Consent ⇒ gated). This is
	// what makes `<PolicyStackProvider>` mount the consent store automatically.
	cookies: {
		used: cookies,
		context: {
			essential: { lawfulBasis: LegalBases.LegalObligation },
			analytics: { lawfulBasis: LegalBases.Consent },
			marketing: { lawfulBasis: LegalBases.Consent },
		},
	},
	thirdParties,
	trackingTechnologies: ["web beacons", "local storage"],
	// Consent UX affordances — validated against the wired runtime; `canWithdraw`
	// surfaces the preferences route.
	consentMechanism: {
		hasBanner: true,
		hasPreferencePanel: true,
		canWithdraw: true,
	},
	children: { underAge: 16, noticeUrl: "https://acme.com/parental-notice" },
	automatedDecisionMaking: [],
});
