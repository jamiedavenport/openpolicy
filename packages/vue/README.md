# `@openpolicy/vue`

> Vue components for rendering [OpenPolicy](https://openpolicy.sh) documents at runtime.

`@openpolicy/vue` provides headless Vue components that compile and render policies directly from config.

## Install

```sh
bun add @openpolicy/vue @openpolicy/sdk
```

## Usage

```ts
// openpolicy.ts
import { defineConfig, LegalBases } from "@openpolicy/sdk";

export default defineConfig({
	company: {
		name: "Acme Inc.",
		legalName: "Acme Corporation",
		address: "123 Main St, Springfield, USA",
		contact: "privacy@acme.com",
	},
	effectiveDate: "2026-01-01",
	jurisdictions: ["eu", "us-ca"],
	data: {
		collected: { "Account Information": ["Email", "Name"] },
		purposes: { "Account Information": "To create and manage user accounts" },
		lawfulBasis: { "Account Information": LegalBases.Contract },
		retention: { "Account Information": "Until account deletion" },
	},
	cookies: {
		used: { essential: true, analytics: false, marketing: false },
		lawfulBasis: {
			essential: LegalBases.LegalObligation,
			analytics: LegalBases.Consent,
			marketing: LegalBases.Consent,
		},
	},
	thirdParties: [],
});
```

```ts
// App.ts
import openpolicy from "./openpolicy";
import { OpenPolicy, PrivacyPolicy } from "@openpolicy/vue";

export default {
	components: { OpenPolicy, PrivacyPolicy },
	template: `
		<OpenPolicy :config="openpolicy">
			<PrivacyPolicy />
		</OpenPolicy>
	`,
	data() {
		return { openpolicy };
	},
};
```

## Exports

- `OpenPolicy`
- `PrivacyPolicy`
- `CookiePolicy`
- `renderDocument`

## Links

- [GitHub](https://github.com/jamiedavenport/openpolicy)
- [openpolicy.sh](https://openpolicy.sh)
