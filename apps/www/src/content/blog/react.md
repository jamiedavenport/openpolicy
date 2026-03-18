---
title: "Build Privacy Policies Your Customers Actually Want to Read"
description: "Render your privacy policy and terms of service directly into your React, Next.js, or TanStack app as components you fully control — swap every heading, paragraph, and section for your own."
pubDate: 2026-03-18
author: "OpenPolicy Team"
---

Policy pages are always an afterthought. An unstyled wall of text, pasted from a Google Doc, completely disconnected from the rest of your product — your nav, your fonts, your brand. Every other page in your app got a design review. Your privacy policy got a Ctrl+V.

That matters more than it used to. Users care more about where their data goes, and regulators across the US, EU, and beyond are holding companies to higher standards. A policy page that looks like it was abandoned in 2014 signals you haven't thought seriously about either.

`@openpolicy/react` lets you render your policy content directly into your React, Next.js, or TanStack app as native components. Same design system, same fonts, same attention to detail as everything else you ship.

## Install

```sh
bun add @openpolicy/sdk @openpolicy/react
```

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
  privacy: {
    effectiveDate: "2026-03-18",
    dataCollected: {
      "Account information": ["Email address", "Display name"],
      "Usage data": ["Pages visited", "Session duration"],
    },
    legalBasis: "Legitimate interests and user consent",
    retention: {
      "Account data": "Until account deletion",
      "Analytics data": "13 months",
    },
    cookies: {
      essential: true,
      analytics: true,
      marketing: false,
    },
    thirdParties: [
      { name: "Vercel", purpose: "Hosting and edge delivery" },
      { name: "Plausible", purpose: "Privacy-friendly analytics" },
    ],
    userRights: ["access", "erasure", "portability", "objection"],
    jurisdictions: ["us", "eu"],
  },
  terms: {
    effectiveDate: "2026-03-18",
    acceptance: {
      methods: ["using the service", "creating an account"],
    },
    eligibility: {
      minimumAge: 13,
    },
    accounts: {
      registrationRequired: true,
      userResponsibleForCredentials: true,
      companyCanTerminate: true,
    },
    prohibitedUses: [
      "Violating any applicable laws or regulations",
      "Attempting to gain unauthorized access to any part of the service",
      "Transmitting malware or malicious code",
    ],
    intellectualProperty: {
      companyOwnsService: true,
      usersMayNotCopy: true,
    },
    disclaimers: {
      serviceProvidedAsIs: true,
      noWarranties: true,
    },
    limitationOfLiability: {
      excludesIndirectDamages: true,
      liabilityCap: "the amount paid by the user in the past 12 months",
    },
    governingLaw: {
      jurisdiction: "Delaware, USA",
    },
    changesPolicy: {
      noticeMethod: "email or prominent notice on the website",
      noticePeriodDays: 30,
    },
  },
});
```

## Render it directly into your app

Wrap your page in `<OpenPolicy>` and drop in `<PrivacyPolicy />`. Import the default styles to get sensible typography out of the box:

```tsx
import { OpenPolicy, PrivacyPolicy } from "@openpolicy/react";
import "@openpolicy/react/styles.css";
import openpolicy from "./openpolicy";

export function PrivacyPolicyPage() {
  return (
    <OpenPolicy config={openpolicy}>
      <PrivacyPolicy />
    </OpenPolicy>
  );
}
```

That's a working privacy policy page. No build script, no generated files. The same flow works for terms and cookies — swap in `<TermsOfService />` or `<CookiePolicy />` and you're done.

## Make it yours

Every part of the document is customisable — headings, paragraphs, sections, links. Pass your own components and OpenPolicy uses them instead of the defaults. Here's a practical example with plain Tailwind classes:

```tsx
const Section = ({ section, children }) => (
  <section id={section.id} className="mb-10 border-b pb-10 last:border-b-0">
    {children}
  </section>
);

const Heading = ({ node }) => {
  const Tag = `h${node.level}` as "h2" | "h3";
  return <Tag className="text-xl font-semibold mb-3 text-gray-900">{node.value}</Tag>;
};

const Paragraph = ({ children }) => (
  <p className="text-gray-600 leading-relaxed mb-4">{children}</p>
);

export function PrivacyPolicyPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-16">
      <OpenPolicy config={openpolicy}>
        <PrivacyPolicy components={{ Section, Heading, Paragraph }} />
      </OpenPolicy>
    </main>
  );
}
```
## Why this is better than a static page

- **Builds trust.** A policy page that matches your product's design tells users you care about the details — including the ones that protect them.
- **Type-safe.** Every field is checked by TypeScript. You can't ship a policy with a missing contact email.
- **Structured.** Each section is generated from your actual config — no stale placeholder text.
- **Version-controlled.** The config lives in your repo. `git blame` shows you when and why anything changed.
- **Jurisdiction-aware.** Set `jurisdictions: ["eu"]` and GDPR-required sections (right to erasure, data transfers, DPA contact) are included automatically.

## We want to see what you build

Policy pages don't have to be ugly. If you ship a custom policy page with OpenPolicy, share it — open an issue on GitHub, tag us, or post it wherever you talk about the things you build. We're collecting examples and would love to feature yours.
