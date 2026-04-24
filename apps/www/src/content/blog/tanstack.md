---
title: "Ship a Privacy Policy with Your TanStack App"
description: "Use the OpenPolicy Vite plugin to generate a legally-structured privacy policy at build time — no Google Docs, no copy-paste."
pubDate: 2026-03-06
author: "OpenPolicy Team"
---

Most TanStack Start apps need a privacy policy before they launch. The usual approach: grab a template from the internet, paste it into a static page, and forget about it until a lawyer asks why it still says "Company Name Here."

OpenPolicy treats your policies like code. You define them as TypeScript objects, and the Vite plugin compiles them to HTML at build time — in sync with every deploy.

## Install

```sh
bun add -D @openpolicy/sdk @openpolicy/vite
```

## Add the plugin to `vite.config.ts`

```ts
import { openPolicy } from "@openpolicy/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [
		openPolicy({
			formats: ["html"],
			outDir: "src/policies",
		}),
		tanstackStart(),
		viteReact(),
	],
});
```

The `openPolicy()` plugin goes before `tanstackStart()`. On the first `bun run dev`, if the config file doesn't exist yet, the plugin scaffolds it automatically. Edit the generated file and save — the plugin watches for changes and regenerates.

## Define your policies

Create a single `openpolicy.ts` at the root of your project. The unified `defineConfig()` lets you define all policies in one file with a shared `company` block:

```ts
// openpolicy.ts
import { defineConfig } from "@openpolicy/sdk";

export default defineConfig({
	company: {
		name: "Acme",
		legalName: "Acme, Inc.",
		address: "123 Main St, San Francisco, CA 94105",
		contact: "privacy@acme.com",
	},
	effectiveDate: "2026-03-06",
	jurisdictions: ["eu", "us-ca"],
	dataCollected: {
		"Account information": ["Email address", "Display name"],
		"Usage data": ["Pages visited", "Session duration"],
	},
	legalBasis: ["legitimate_interests", "consent"],
	retention: {
		"Account data": "Until account deletion",
		"Analytics data": "13 months",
	},
	thirdParties: [
		{ name: "Vercel", purpose: "Hosting and edge delivery" },
		{ name: "Plausible", purpose: "Privacy-friendly analytics" },
	],
	cookies: {
		essential: true,
		analytics: true,
		marketing: false,
	},
});
```

## What gets generated

After the next build (or on save in dev), the plugin writes:

```
src/policies/
  privacy-policy.html
```

Because the files land inside `src/`, Vite can resolve them as `?raw` imports directly from your route components.

## Render on a dedicated route

Create a route file for the policy. TanStack Router picks it up automatically via file-based routing:

```tsx
// src/routes/privacy.tsx
import { createFileRoute } from "@tanstack/react-router";
import html from "../policies/privacy-policy.html?raw";

export const Route = createFileRoute("/privacy")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
```

TanStack Router auto-generates `routeTree.gen.ts` when it detects the new file — no manual registration needed.

Add a `.gitignore` entry so the generated files aren't checked in:

```
# .gitignore
src/policies/
```

## Why this is better than a static page

- **Type-safe.** Every field is checked by TypeScript. You can't ship a policy with a missing contact email.
- **Structured.** Each section is generated from your actual config — no stale placeholder text.
- **Version-controlled.** The config lives in your repo. `git blame` shows you when and why anything changed.
- **Jurisdiction-aware.** Set `jurisdictions: ["eu"]` and GDPR-required sections (right to erasure, data transfers, DPA contact) are included automatically.

The generated HTML includes all required sections for the jurisdictions you specify. You own the config; OpenPolicy handles the legal structure.
