---
title: "@opencookies/svelte"
description: "Svelte 5 runes adapter, with a Svelte 4 Readable fallback"
product: opencookies
---

Svelte adapter for OpenCookies. Runes-first for Svelte 5; ships a `Readable<ConsentState>` fallback at `@opencookies/svelte/stores` for Svelte 4. Wraps [`@opencookies/core`](/docs/opencookies/core).

## Install

```sh
bun add @opencookies/core @opencookies/svelte
```

Peer dependencies: `svelte >= 4`.

## Setup (Svelte 5 runes)

Call `setOpenCookiesContext` once in a root component (e.g., `+layout.svelte` for SvelteKit):

```svelte
<script lang="ts">
  import { setOpenCookiesContext } from "@opencookies/svelte";
  import type { Category } from "@opencookies/core";

  const categories: Category[] = [
    { key: "essential", label: "Essential", locked: true },
    { key: "analytics", label: "Analytics" },
    { key: "marketing", label: "Marketing" },
  ];

  setOpenCookiesContext({ config: { categories } });

  let { children } = $props();
</script>

{@render children?.()}
```

You can pass a pre-created store with `setOpenCookiesContext({ store })` instead.

## API

### `getConsent()`

Returns a reactive object whose properties are tracked via `$state`. Read directly in markup — no destructuring required to keep reactivity.

```svelte
<script lang="ts">
  import { getConsent } from "@opencookies/svelte";

  const consent = getConsent();
</script>

{#if consent.route === "cookie"}
  <div class="banner">
    <button onclick={consent.acceptNecessary}>Necessary only</button>
    <button onclick={consent.acceptAll}>Accept all</button>
    <button onclick={() => consent.setRoute("preferences")}>Customize</button>
  </div>
{/if}
```

### `getCategory(key)`

Granular per-category access.

```svelte
<script lang="ts">
  import { getCategory } from "@opencookies/svelte";

  const analytics = getCategory("analytics");
</script>

<label>
  <input type="checkbox" checked={analytics.granted} onchange={analytics.toggle} />
  Analytics
</label>
```

### `<ConsentGate>`

Renders the `children` snippet when an expression is satisfied; renders `fallback` snippet otherwise.

```svelte
<script lang="ts">
  import { ConsentGate } from "@opencookies/svelte";
  import Chart from "./Chart.svelte";
  import EnablePrompt from "./EnablePrompt.svelte";
</script>

<ConsentGate requires="analytics">
  {#snippet children()}
    <Chart />
  {/snippet}
  {#snippet fallback()}
    <EnablePrompt />
  {/snippet}
</ConsentGate>

<ConsentGate requires={{ and: ["analytics", "marketing"] }}>
  {#snippet children()}
    <PersonalizedPromo />
  {/snippet}
</ConsentGate>
```

## SvelteKit (SSR + hydration)

Call `setOpenCookiesContext` from your root layout. It uses Svelte's `setContext`, so it hydrates safely:

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import { setOpenCookiesContext } from "@opencookies/svelte";
  import { categories } from "$lib/cookies";

  setOpenCookiesContext({ config: { categories } });

  let { children } = $props();
</script>

{@render children()}
```

## Svelte 4 stores fallback

For Svelte 4 codebases (or when you prefer `$store` syntax), import from the `/stores` subpath:

```svelte
<script>
  import { createConsentReadable } from "@opencookies/svelte/stores";

  const consent = createConsentReadable({
    config: { categories: [/* ... */] },
  });

  $: route = $consent.route;
</script>

{#if route === "cookie"}
  <button on:click={consent.acceptAll}>Accept all</button>
{/if}
```

`createConsentReadable` returns a `Readable<ConsentState>` augmented with the same action methods as `getConsent()` (`acceptAll`, `toggle`, `save`, `has`, etc.).

## Shared concepts

Categories, GPC handling, jurisdiction resolvers, re-consent triggers, script gating (`gateScript`), and storage adapters all live in [`@opencookies/core`](/docs/opencookies/core) — the Svelte adapter is a thin reactivity wrapper. A working example is in [`examples/svelte`](../../examples/svelte/).

## See also

- [`@opencookies/core`](/docs/opencookies/core) — shared concepts and config reference
- [`@opencookies/vite`](/docs/opencookies/vite) — build-time check for ungated cookie / vendor calls
- [Other adapters](../../#packages) — React, Vue, Solid

## License

Apache-2.0
