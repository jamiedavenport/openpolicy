---
title: "@opencookies/angular"
description: "Angular 18+ adapter — provideOpenCookies, ConsentService, *ocConsent"
product: opencookies
---

Angular 18+ adapter for OpenCookies. Bridges [`@opencookies/core`](/docs/opencookies/core) with Angular's signal reactivity.

## Install

```sh
pnpm add @opencookies/core @opencookies/angular
```

Peer dependencies: `@angular/core >= 18`, `@angular/common >= 18`.

## Setup

Register the provider once at the root of your standalone application:

```ts
import { bootstrapApplication } from "@angular/platform-browser";
import { provideOpenCookies } from "@opencookies/angular";
import { localStorageAdapter } from "@opencookies/core/storage/local-storage";
import { AppComponent } from "./app.component";

bootstrapApplication(AppComponent, {
	providers: [
		provideOpenCookies({
			config: {
				categories: [
					{ key: "essential", label: "Essential", locked: true },
					{ key: "analytics", label: "Analytics" },
					{ key: "marketing", label: "Marketing" },
				],
				adapter: localStorageAdapter(),
			},
		}),
	],
});
```

You can pass a pre-created store instead of `config`:

```ts
import { createConsentStore } from "@opencookies/core";

const store = createConsentStore({ categories });
provideOpenCookies({ store });
```

## API

### `ConsentService`

Inject `ConsentService` anywhere to read consent state via signals and trigger actions.

```ts
import { Component, inject } from "@angular/core";
import { ConsentService } from "@opencookies/angular";

@Component({
	selector: "app-banner",
	standalone: true,
	template: `
		@if (consent.route() === "cookie") {
			<div>
				<button (click)="consent.acceptNecessary()">Necessary only</button>
				<button (click)="consent.acceptAll()">Accept all</button>
				<button (click)="consent.setRoute('preferences')">Customize</button>
			</div>
		}
	`,
})
export class BannerComponent {
	readonly consent = inject(ConsentService);
}
```

Signal properties: `route`, `categories`, `decisions`, `jurisdiction`, `policyVersion`, `decidedAt`, `repromptReason`, `state`.

Methods: `acceptAll`, `acceptNecessary`, `reject`, `toggle`, `save`, `setRoute`, `has`, `getConsentRecord`, `getPreviousRecord`.

### `injectCategory(key)`

Granular per-category access. Must be called inside an injection context (e.g. a component constructor or field initializer).

```ts
import { Component } from "@angular/core";
import { injectCategory } from "@opencookies/angular";

@Component({
	selector: "category-row",
	standalone: true,
	template: `
		<label>
			<input type="checkbox" [checked]="analytics.granted()" (change)="analytics.toggle()" />
			Analytics
		</label>
	`,
})
export class CategoryRowComponent {
	readonly analytics = injectCategory("analytics");
}
```

### `*ocConsent` directive

Structural directive that conditionally renders content based on a consent expression. Mirrors `@opencookies/react`'s `<ConsentGate>` and `@opencookies/vue`'s `<ConsentGate>`.

```ts
import { Component } from "@angular/core";
import { ConsentGate } from "@opencookies/angular";
import { ChartComponent } from "./chart.component";
import { EnablePromptComponent } from "./enable-prompt.component";

@Component({
	selector: "gated-chart",
	standalone: true,
	imports: [ConsentGate, ChartComponent, EnablePromptComponent],
	template: `
		<chart *ocConsent="'analytics'; else fallback"></chart>
		<ng-template #fallback>
			<enable-prompt></enable-prompt>
		</ng-template>

		<personalized-promo *ocConsent="{ and: ['analytics', 'marketing'] }"></personalized-promo>
	`,
})
export class GatedChartComponent {}
```

The directive emits no DOM wrapper — only the templated content (or its fallback) is rendered.

## SSR (Angular Universal)

`provideOpenCookies` runs the store factory once per request injector on the server, which is the right scope for cookie/header-based jurisdiction or storage. Use `@opencookies/core/storage/server` for a server-side adapter seeded from the inbound request, and the local-storage / cookie adapters in the browser. See [`@opencookies/core`](/docs/opencookies/core) for storage adapter details.

## Shared concepts

Categories, GPC handling, jurisdiction resolvers, re-consent triggers, script gating (`gateScript`), and storage adapters all live in [`@opencookies/core`](/docs/opencookies/core) — the Angular adapter is a thin reactivity wrapper. A working example is in [`examples/angular`](../../examples/angular/).

## See also

- [`@opencookies/core`](/docs/opencookies/core) — shared concepts and config reference
- [`@opencookies/vite`](/docs/opencookies/vite) — build-time check for ungated cookie / vendor calls
- [Other adapters](../../#packages) — React, Vue, Solid, Svelte

## License

Apache-2.0
