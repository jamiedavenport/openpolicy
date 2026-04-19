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
import { defineConfig } from "@openpolicy/sdk";

export default defineConfig({
	company: {
		name: "Acme Inc.",
		legalName: "Acme Corporation",
		address: "123 Main St, Springfield, USA",
		contact: "privacy@acme.com",
	},
	privacy: {
		effectiveDate: "2026-01-01",
		dataCollected: { "Account Information": ["Email", "Name"] },
		legalBasis: "Legitimate interests and consent",
		retention: { "Account data": "Until account deletion" },
		cookies: { essential: true, analytics: false, marketing: false },
		thirdParties: [],
		userRights: ["access", "erasure"],
		jurisdictions: ["us", "eu"],
	},
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
- `defaultStyles`
- `./styles.css`

## Links

- [GitHub](https://github.com/jamiedavenport/openpolicy)
- [openpolicy.sh](https://openpolicy.sh)
