---
title: "Building a Legal Chatbot with OpenPolicy and AI SDK"
description: "Compile your privacy policy and terms of service into a Claude system prompt and stream plain-English answers — no RAG, no vector DB, just a route handler and 100 lines of React."
pubDate: 2026-03-21
author: "OpenPolicy Team"
---

Nobody reads privacy policies. They're long, dense, and written for lawyers, not users. But the information in them matters — and with a language model and a couple of hours of work, you can let users just ask questions instead.

Here's what we built: a chat UI in Next.js where users can ask things like "how can I delete my data?" or "what happens if you terminate my account?" and get clear, accurate answers sourced directly from the site's own policies.

The interesting part is how the policies get into the model. Rather than RAG or a vector database, we compile them to Markdown at startup and drop the whole thing into the system prompt. For legal documents this is actually the right call — I'll explain why below.

<!-- IMAGE: Screenshot of the chat UI with an active conversation -->

You can find the [full working example on GitHub](https://github.com/openpolicyai/openpolicy/tree/main/examples/nextjs). This post walks through how it's built and the decisions behind it.

---

## The setup

Install the OpenPolicy packages alongside your existing AI SDK dependencies:

```sh
bun add @openpolicy/sdk @openpolicy/core @openpolicy/renderers
```

- **`@openpolicy/sdk`** — type-safe policy authoring
- **`@openpolicy/core`** — compilation engine
- **`@openpolicy/renderers`** — renders compiled policies to Markdown, HTML, or PDF

---

## Define your policies

Create `openpolicy.ts` at the project root. One config, both policies:

```ts
import { defineConfig } from "@openpolicy/sdk";

export default defineConfig({
  company: {
    name: "Your Company",
    legalName: "Your Company, Inc.",
    address: "123 Main St, City, State, ZIP",
    contact: "privacy@yourcompany.com",
  },
  privacy: {
    effectiveDate: "2026-03-09",
    dataCollected: {
      "Personal Information": ["Full name", "Email address"],
    },
    legalBasis: "Legitimate interests and consent",
    retention: {
      "All personal data": "As long as necessary for the purposes described in this policy",
    },
    cookies: { essential: true, analytics: false, marketing: false },
    thirdParties: [],
    userRights: ["access", "erasure"],
    jurisdictions: ["us"],
  },
  terms: {
    effectiveDate: "2026-03-09",
    acceptance: { methods: ["using the service", "creating an account"] },
    eligibility: { minimumAge: 13 },
    accounts: {
      registrationRequired: false,
      userResponsibleForCredentials: true,
      companyCanTerminate: true,
    },
    prohibitedUses: [
      "Violating any applicable laws or regulations",
      "Infringing on intellectual property rights",
    ],
    intellectualProperty: { companyOwnsService: true, usersMayNotCopy: true },
    termination: { companyCanTerminate: true, userCanTerminate: true },
    disclaimers: { serviceProvidedAsIs: true, noWarranties: true },
    limitationOfLiability: { excludesIndirectDamages: true },
    governingLaw: { jurisdiction: "Delaware, USA" },
    changesPolicy: {
      noticeMethod: "email or prominent notice on our website",
      noticePeriodDays: 30,
    },
  },
});
```

You're declaring *facts* — what data you collect, what rights users have, which jurisdictions you operate in — and OpenPolicy generates correctly worded legal prose from them. It's fully typed, so mistakes get caught at author time rather than discovered after you've shipped.

---

## Wire up the provider

OpenPolicy ships a React provider so the built-in `<PrivacyPolicy />` and `<TermsOfService />` components can pick up your config. Even if the chatbot is all you want right now, it's worth setting up — it makes adding rendered policy pages later trivial.

```tsx
// app/providers.tsx
"use client";

import { OpenPolicy } from "@openpolicy/react";
import type { ReactNode } from "react";
import openpolicy from "../openpolicy";

export function Providers({ children }: { children: ReactNode }) {
  return <OpenPolicy config={openpolicy}>{children}</OpenPolicy>;
}
```

```tsx
// app/layout.tsx
import { Providers } from "./providers";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

<!-- IMAGE: Screenshot of the privacy policy page rendered in the browser -->

---

## The API route

This is the interesting part. Create `app/api/chat/route.ts`:

```ts
import { anthropic } from "@ai-sdk/anthropic";
import { compile, expandOpenPolicyConfig } from "@openpolicy/core";
import { renderMarkdown } from "@openpolicy/renderers";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import openpolicy from "../../../openpolicy";

const inputs = expandOpenPolicyConfig(openpolicy);
const policiesMarkdown = inputs
  .map((input) => renderMarkdown(compile(input)))
  .join("\n\n---\n\n");

const SYSTEM_PROMPT = `You are a legal assistant for ${openpolicy.company.name}. \
Answer questions about the following policies clearly and concisely. \
Cite specific sections when relevant. Do not speculate beyond what the policies state.

${policiesMarkdown}`;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();
  const result = streamText({
    model: anthropic("claude-sonnet-4-6"),
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
  });
  return result.toUIMessageStreamResponse();
}
```

**Why Markdown instead of HTML?** The renderers support both, but Markdown is the better choice for LLM context. HTML tags burn tokens without adding meaning. Markdown gives the model the same structural information — headings, lists, emphasis — without the noise.

**Why a system prompt instead of RAG?** Privacy policies and terms of service are short (typically 2,000–5,000 words combined), deterministic, and meant to be understood as a whole. A user asking about termination might also need to know about the notice period, what happens to their data, and whether they can appeal — all from different sections. Stuffing the full documents in as context lets Claude surface that complete picture naturally, without retrieval getting in the way.

If you have a large suite of policies that push against context limits, [Anthropic's prompt caching](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching) is worth looking at — the policy content doesn't change between requests, so you'd pay for those tokens once per cache TTL rather than every call.

---

## The chat UI

On the client side, this is standard AI SDK v5 with [AI Elements](https://ai-elements.dev) components for the chat layout. One thing worth calling out: the `isAnimating` prop on `<MessageResponse>`:

```tsx
const isLastAssistant = msg.role === "assistant" && i === messages.length - 1;

<MessageResponse isAnimating={isLastAssistant && isStreaming}>
  {text}
</MessageResponse>
```

`isAnimating` enables Streamdown's typewriter rendering — tokens appear progressively as they arrive. You only want it on the message currently being streamed; everything before that should render as static Markdown immediately. Getting this wrong makes previously completed messages re-animate on every render, which looks broken.

AI Elements' `<PromptInputSubmit>` handles the stop button automatically — pass it `status` and `onStop` and it switches between send and stop states without any extra logic on your end.

The empty state uses a handful of starter questions so users aren't staring at a blank input:

```tsx
const STARTERS = [
  "What data do you collect about me?",
  "How can I delete my data?",
  "What are the terms for account termination?",
  "What is the governing law for disputes?",
];

// In the empty state:
{STARTERS.map((q) => (
  <button key={q} onClick={() => sendMessage({ text: q })} ...>
    {q}
  </button>
))}
```

One Tailwind config note: Streamdown's classes live in `node_modules` and won't be picked up by the content scanner. Add this to `globals.css`:

```css
@source "../node_modules/streamdown/dist/*.js";
```

<!-- IMAGE: Screenshot of the chat UI showing the empty state with starter question buttons -->

---

## Run it

```sh
echo "ANTHROPIC_API_KEY=sk-ant-..." >> .env.local
bun run dev
```

Go to `http://localhost:3000/chat`.

<!-- IMAGE: Screenshot of the home page with nav links to policy pages and the chat -->

---

## Before you ship

**Rate-limit the route.** It calls the Anthropic API on every request — an unprotected endpoint is a direct line to your bill. Something like `@upstash/ratelimit` keyed on the client IP is usually enough:

```ts
const identifier = req.headers.get("x-forwarded-for") ?? "anonymous";
const { success } = await ratelimit.limit(identifier);
if (!success) return new Response("Too many requests", { status: 429 });
```

**The chat is stateless by default.** Each page load starts fresh. If you want persistence, store messages in a database and pass them back via `initialMessages`.

**Policy pages come for free.** The same config that feeds the chatbot also powers `<PrivacyPolicy />` and `<TermsOfService />` components — rendered HTML pages, linked from the footer. Users who want to read the full document still can.

---

The [full example](https://github.com/openpolicyai/openpolicy/tree/main/examples/nextjs) has everything wired together — policy pages, the chat route, and the UI — if you want to poke around or fork it as a starting point.
