---
title: "How to Build a Legal Chatbot with OpenPolicy and AI SDK"
description: "Compile your privacy policy and terms of service into a Claude system prompt and stream plain-English answers to user questions — in about 100 lines of Next.js."
pubDate: 2026-03-21
author: "OpenPolicy Team"
---

Most users never read a privacy policy or terms of service. The documents are long, written in legalese, and buried in footers. But the information in them matters — users have rights, and they should be able to exercise them. What if instead of a PDF wall of text, your site had a conversational assistant that could answer "how can I delete my data?" in plain English, instantly?

In this tutorial we'll build exactly that: a chat UI embedded in a Next.js app that answers questions about the site's own privacy policy and terms of service. The policies are defined in TypeScript using OpenPolicy, compiled to Markdown at startup, injected into a Claude system prompt, and streamed back to the user via Vercel's AI SDK.

By the end you'll have:

- A type-safe policy config that generates both a privacy policy and terms of service
- A `/api/chat` route that compiles those policies and answers questions about them
- A polished chat UI built with AI Elements (shadcn-style components for AI interfaces)
- An understanding of why this approach works — and when to reach for something more complex

---

## How it works

The data flow is straightforward:

```
openpolicy.ts
  └─ defineConfig()              ← one config, both policies
       └─ expandOpenPolicyConfig()    ← splits into [privacyInput, termsInput]
            └─ compile()              ← builds PolicySection[] for each
                 └─ renderMarkdown()       ← serializes to Markdown string
                      └─ system prompt     ← passed to Claude on every request
                           └─ streamText()      ← AI SDK streaming
                                └─ chat UI       ← React, AI Elements components
```

The entire policy context fits comfortably in Claude's context window. Because the policies are short and deterministic — they come from a structured config, not free-form text — there's no need for retrieval or chunking. The full documents go into the system prompt, and Claude answers with direct citations.

<!-- IMAGE: Architecture diagram showing the data flow from openpolicy.ts through compile/renderMarkdown to the system prompt and streaming chat UI -->

---

## Prerequisites

- **Bun** (or Node 18+)
- An **Anthropic API key** — get one at [console.anthropic.com](https://console.anthropic.com)
- Basic familiarity with Next.js App Router

---

## Step 1 — Project setup

Create a new Next.js app and install the required packages:

```sh
bun create next-app legal-chatbot --typescript --tailwind --app
cd legal-chatbot
bun add @openpolicy/sdk @openpolicy/core @openpolicy/renderers
bun add @ai-sdk/anthropic @ai-sdk/react ai
```

| Package | Role |
|---|---|
| `@openpolicy/sdk` | `defineConfig()` — the type-safe policy authoring API |
| `@openpolicy/core` | `compile()` and `expandOpenPolicyConfig()` — the compilation engine |
| `@openpolicy/renderers` | `renderMarkdown()` — serializes compiled policy to a Markdown string |
| `@ai-sdk/anthropic` | Anthropic provider for Vercel AI SDK |
| `@ai-sdk/react` | `useChat` hook |
| `ai` | Core AI SDK — `streamText`, `DefaultChatTransport`, message types |

---

## Step 2 — Define your policies

Create `openpolicy.ts` at the project root. This single file defines both your privacy policy and terms of service:

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
      "All personal data":
        "As long as necessary for the purposes described in this policy",
    },
    cookies: { essential: true, analytics: false, marketing: false },
    thirdParties: [],
    userRights: ["access", "erasure"],
    jurisdictions: ["us"],
  },
  terms: {
    effectiveDate: "2026-03-09",
    acceptance: {
      methods: ["using the service", "creating an account"],
    },
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
    intellectualProperty: {
      companyOwnsService: true,
      usersMayNotCopy: true,
    },
    termination: {
      companyCanTerminate: true,
      userCanTerminate: true,
    },
    disclaimers: {
      serviceProvidedAsIs: true,
      noWarranties: true,
    },
    limitationOfLiability: {
      excludesIndirectDamages: true,
    },
    governingLaw: { jurisdiction: "Delaware, USA" },
    changesPolicy: {
      noticeMethod: "email or prominent notice on our website",
      noticePeriodDays: 30,
    },
  },
});
```

A few things worth noting:

**Single config, dual output.** The `privacy` and `terms` keys live side by side. `expandOpenPolicyConfig()` splits this into two separate `PolicyInput` objects — one typed `"privacy"`, one typed `"terms"` — so you can compile and render them independently.

**Structured, not freeform.** Instead of writing policy prose yourself, you declare facts: what data you collect, what jurisdictions you operate in, what rights users have. OpenPolicy generates correctly worded legal language from those declarations. The output is consistent and auditable.

**TypeScript all the way down.** The config is fully type-checked. If you add a jurisdiction that doesn't exist, or omit a required field, TypeScript tells you at author time, not at runtime.

---

## Step 3 — Wire up the provider

OpenPolicy ships a React provider that makes your config available to the built-in `<PrivacyPolicy />` and `<TermsOfService />` components. Even if you're only building the chatbot, it's worth setting up — the components are a nice complement to the chat UI.

```tsx
// app/providers.tsx
"use client";

import { OpenPolicy } from "@openpolicy/react";
import type { ReactNode } from "react";
import openpolicy from "../openpolicy";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <OpenPolicy config={openpolicy}>
      {children}
    </OpenPolicy>
  );
}
```

Then wrap your root layout:

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

<!-- IMAGE: Screenshot of the privacy policy page rendered in the browser using the <PrivacyPolicy /> component -->

---

## Step 4 — Build the chat API route

This is the core of the integration. Create `app/api/chat/route.ts`:

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

Let's walk through what's happening:

**Module-level compilation.** The first four lines run once when the route module is first loaded — not on every request. `expandOpenPolicyConfig(openpolicy)` splits the combined config into `[privacyInput, termsInput]`. Each input is `compile()`d into a `PolicySection[]` array and `renderMarkdown()`d into a Markdown string. The two documents are joined with a horizontal rule separator.

**Why Markdown over HTML?** `renderMarkdown()` produces clean, structured text. HTML would include tags that consume tokens without adding meaning to the model. Markdown preserves document structure — headings, lists, bold terms — which helps Claude reference specific sections accurately.

**System prompt construction.** The company name is interpolated directly so the assistant identifies itself correctly. The full policy Markdown follows. Claude has both documents available for every message in the conversation.

**`convertToModelMessages(messages)`** is an AI SDK v5 utility that converts the `UIMessage[]` format (which includes rendering metadata) into the plain message format that model providers expect.

**`result.toUIMessageStreamResponse()`** returns a streaming `Response` using AI SDK's UI message streaming protocol — the same protocol `useChat` on the client side knows how to consume.

**A note on performance.** The system prompt is built once at module load time, so compilation happens once per cold start rather than once per request. For production, consider enabling Anthropic's [prompt caching](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching) — policies don't change between requests, so cached prompt tokens are effectively free after the first request.

---

## Step 5 — Install AI Elements

AI Elements is a set of shadcn-style components designed for AI chat interfaces. Install the ones you need:

```sh
bunx ai-elements@latest add conversation message prompt-input
```

This copies the component source into `components/ai-elements/` in your project — the same pattern as shadcn/ui.

One more step: the `MessageResponse` component uses [Streamdown](https://github.com/ai-elements/streamdown) to render streaming Markdown with animated token appearance. Streamdown's Tailwind classes live in `node_modules` and won't be scanned by default. Add an `@source` directive to `globals.css`:

```css
/* app/globals.css */
@import "tailwindcss";

@source "../node_modules/streamdown/dist/*.js";

/* rest of your CSS... */
```

This tells Tailwind to scan the Streamdown bundle for class names and include them in the output.

---

## Step 6 — Build the chat UI

Create `app/chat/page.tsx`:

```tsx
"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";

const STARTERS = [
  "What data do you collect about me?",
  "How can I delete my data?",
  "What are the terms for account termination?",
  "What is the governing law for disputes?",
];

export default function ChatPage() {
  const { messages, sendMessage, status, stop } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const isStreaming = status === "streaming" || status === "submitted";

  function handleSubmit({ text }: { text: string }) {
    if (!text.trim() || isStreaming) return;
    sendMessage({ text });
  }

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto">
      <header className="px-6 py-4 border-b">
        <h1 className="text-xl font-semibold">Legal Assistant</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Ask questions about our privacy policy and terms of service
        </p>
      </header>

      <Conversation className="flex-1">
        <ConversationContent>
          {messages.length === 0 && (
            <ConversationEmptyState title="" description="">
              <div className="flex flex-col gap-2 w-full max-w-sm">
                <p className="text-sm text-muted-foreground text-center mb-2">
                  Try one of these questions:
                </p>
                {STARTERS.map((q) => (
                  <button
                    type="button"
                    key={q}
                    onClick={() => sendMessage({ text: q })}
                    className="text-left text-sm px-4 py-2.5 rounded-lg border hover:bg-muted transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </ConversationEmptyState>
          )}

          {messages.map((msg, i) => {
            const text = msg.parts
              .filter((p) => p.type === "text")
              .map((p) => p.text)
              .join("");
            const isLastAssistant =
              msg.role === "assistant" && i === messages.length - 1;
            return (
              <Message key={msg.id} from={msg.role}>
                <MessageContent>
                  <MessageResponse isAnimating={isLastAssistant && isStreaming}>
                    {text}
                  </MessageResponse>
                </MessageContent>
              </Message>
            );
          })}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="px-4 py-4 border-t">
        <PromptInput onSubmit={handleSubmit}>
          <PromptInputBody>
            <PromptInputTextarea placeholder="Ask about our policies…" />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools />
            <PromptInputSubmit status={status} onStop={stop} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}
```

Walking through the key parts:

**`useChat` with `DefaultChatTransport`.** AI SDK v5 separates the transport layer. `DefaultChatTransport` handles fetch + SSE parsing for our `/api/chat` endpoint.

**`<ConversationEmptyState>`.** Shown when `messages.length === 0`. The starter question buttons give users something to click immediately, reducing the blank-page friction that kills engagement with chat interfaces.

**Message parts.** AI SDK v5 messages have a `parts` array rather than a single `content` string. Each part has a `type` — we filter for `"text"` parts and join them. This keeps the component forward-compatible with tool calls or image parts you might add later.

**`isAnimating` on `<MessageResponse>`.** This is the streaming animation prop. It's `true` only for the last assistant message while `status` is `"streaming"` or `"submitted"`. Streamdown uses it to enable typewriter-style rendering as tokens arrive. All prior messages render as static Markdown.

**`<PromptInputSubmit status={status} onStop={stop}>`.** The submit button automatically switches to a stop button while streaming, letting users interrupt a long response.

<!-- IMAGE: Screenshot of the chat UI showing the empty state with four starter question buttons -->

<!-- IMAGE: Screenshot of the chat UI with an active conversation — user question visible, assistant response mid-stream -->

---

## Step 7 — Set the env variable and run

```sh
echo "ANTHROPIC_API_KEY=sk-ant-..." >> .env.local
bun run dev
```

Navigate to `http://localhost:3000/chat`.

<!-- IMAGE: Screenshot of the running app home page with navigation to privacy policy, terms of service, and the legal assistant chat -->

---

## How the context works — a deeper look

Why does this work without retrieval or vector search?

Privacy policies and terms of service are short. A typical policy is 2,000–5,000 words — well within a single context window, with room left for conversation history. Unlike a support knowledge base, policies are meant to be read in full. A user asking "can the company terminate my account?" benefits from knowing not just the termination clause, but the notice period, what happens to their data afterward, and whether they can appeal — all in adjacent sections. Full-document context lets Claude surface that complete picture naturally.

Policies are also deterministic. Because OpenPolicy compiles them from a structured config rather than free-form prose, the output is consistent and predictable. Claude isn't trying to reason about ambiguous text — the policy says exactly what it means, section by section.

**When to reach for something more complex.** If you're operating across multiple jurisdictions with materially different policy versions, or if you have a large suite of documents that together exceed a few thousand words, consider:

- **Prompt caching** (Anthropic's beta feature): cache the policy portion of the system prompt so you only pay input tokens once per cache TTL
- **Chunked retrieval**: embed policy sections and retrieve only the top-k relevant ones per question
- **Multi-turn context management**: summarize older turns to keep the context window from filling with conversation history

For most apps with a single privacy policy and a single set of terms, the approach shown here is the right one: simple, correct, and zero infrastructure.

**Model choice.** Claude Sonnet 4.6 balances capability and cost well for this use case. It follows structured instructions precisely, cites specific sections accurately, and declines to speculate beyond what the policies state — exactly the behavior you want from a legal assistant.

---

## Production considerations

**Add your API key to your hosting platform.** On Vercel: Settings → Environment Variables → `ANTHROPIC_API_KEY`. Never commit the key to your repo.

**Rate-limit the `/api/chat` route.** The route calls the Anthropic API on every request, so an unprotected endpoint is a direct line to your bill. Add per-user rate limiting with something like `@upstash/ratelimit`:

```ts
// In your POST handler, before calling streamText:
const identifier = req.headers.get("x-forwarded-for") ?? "anonymous";
const { success } = await ratelimit.limit(identifier);
if (!success) return new Response("Too many requests", { status: 429 });
```

**Chat history is currently stateless.** Each page load starts a fresh conversation. If you want persistence, store messages in a database and pass them as `initialMessages` to `useChat`.

**Audit logging.** For compliance-sensitive use cases, persist conversations so you can demonstrate what your assistant told users.

**Policy pages are also available.** OpenPolicy renders your policies as full HTML pages or PDFs from the same config. The `<PrivacyPolicy />` and `<TermsOfService />` React components render the full documents — link to them from the chat UI for users who want to read the original.

---

The full working example is in the [OpenPolicy GitHub repository](https://github.com/openpolicyai/openpolicy/tree/main/examples/nextjs).
