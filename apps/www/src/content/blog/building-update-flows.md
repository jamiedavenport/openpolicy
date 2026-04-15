---
title: "How to notify users about privacy policy changes without spamming everyone"
description: "Privacy policies change. The hard part isn't updating the document — it's knowing which users need to know, what changed for them specifically, and how to tell them without crying wolf."
pubDate: 2026-04-15
author: "OpenPolicy Team"
---

Privacy policies change. That's fine — it means your product is evolving. But every update creates a problem: how do you tell your users without blasting every single one of them with a wall of legalese they'll immediately dismiss?

The naive answer is "send everyone an email every time anything changes." The result is users who tune out your policy emails entirely — which means when you actually need them to re-consent to something material, nobody's reading it.

OpenPolicy Plus gives you two primitives for building sane, user-friendly policy update flows without building your own consent-tracking system.

## The problem with doing this yourself

Before getting into the API, it's worth being specific about what "building your own" actually involves:

- Storing which version of your policy each user last accepted
- Versioning your policy document as it changes over time
- Computing a diff between two versions of a legal document
- Filtering that diff by jurisdiction — because a GDPR clause change is irrelevant to a user in California, and vice versa
- Keeping all of this consistent as your policy evolves across multiple updates

None of these are hard individually. Together they're a low-priority, high-surface-area maintenance burden that quietly grows as your user base and jurisdictions expand.

## The API

**`consent(userId)`** records that a user has accepted the current version of your policy. Call it at signup to capture initial acceptance, and again whenever a user reviews and accepts a new version.

```ts
import { client } from "@openpolicy/plus";

await client.consent("user_123");
```

**`changes(userId)`** returns everything that's changed in your policy since that user last consented — structured by section, with the old and new text, so you can render it however you want.

```ts
import { client } from "@openpolicy/plus";

const changes = await client.changes("user_123");
// [
//   { section: "data_retention", previous: "90 days", current: "30 days" },
//   { section: "third_party_sharing", previous: null, current: "We share data with..." }
// ]
```

`changes()` is jurisdiction-aware. A GDPR-specific update won't appear for a user in California. A CCPA-specific update won't appear for a user in Germany. You get only the changes that are actually relevant to each user — which is what makes targeted notification possible in the first place.

Those two calls are the foundation for every flow below.

## Building the right flow for your product

There's no single right way to notify users. The right approach depends on how significant the change is, how sensitive your product is, and what your relationship with your users looks like. Here are four patterns, from lightest to heaviest.

### 1. In-app banner for minor updates

For a small wording change or a clarification, a non-blocking banner on next login is usually enough. Users who care will read it; users who don't won't be interrupted.

<!-- IMAGE: Screenshot mockup of a subtle top-of-page banner reading "We've updated our privacy policy — here's what changed" with a "Review & accept" link and an X to dismiss. -->

```ts
import { client } from "@openpolicy/plus";

// On session start
const changes = await client.changes(session.userId);

if (changes.length > 0) {
  showPolicyUpdateBanner({
    changes,
    onAccept: () => client.consent(session.userId),
  });
}
```

### 2. Modal for material changes

When something genuinely significant has changed — new data categories, a new third-party integration, updated retention periods — a modal that requires acknowledgement is appropriate. This is also what regulators expect for material changes to consent.

```ts
import { client } from "@openpolicy/plus";

const changes = await client.changes(session.userId);
const materialChanges = changes.filter(
  (c) => c.section !== "definitions" && c.section !== "contact_info"
);

if (materialChanges.length > 0) {
  showPolicyModal({
    changes: materialChanges,
    onAccept: () => client.consent(session.userId),
    blocking: true, // user must accept to continue
  });
}
```

### 3. Email digest on a schedule

For products where users don't log in frequently, or where you want a paper trail of notification, email is more reliable than hoping the user hits the banner.

```ts
import { client } from "@openpolicy/plus";
import { sendEmail } from "./email";
import { getUsers } from "./db";

const users = await getUsers();

for (const user of users) {
  const changes = await client.changes(user.id);

  if (changes.length === 0) continue;

  await sendEmail({
    to: user.email,
    subject: "We've updated our privacy policy",
    body: renderChangesEmail(changes),
  });
}
```

When the user clicks through and accepts, call `consent()` to record it.

### 4. Plain-English summaries via LLM

A structured diff is exactly what you need for building notification UIs. It's not what most users want to read. You can pipe `changes` into an LLM to turn the structured data into a 2–3 sentence summary in the tone of your product — something a human would actually read.

```ts
import { client } from "@openpolicy/plus";
import Anthropic from "@anthropic-ai/sdk";

const changes = await client.changes("user_123");

const anthropic = new Anthropic();
const message = await anthropic.messages.create({
  model: "claude-opus-4-6",
  max_tokens: 1024,
  messages: [
    {
      role: "user",
      content: `Summarize these privacy policy changes in 2-3 friendly, plain-English sentences. Be specific about what changed but avoid legal language.\n\n${JSON.stringify(changes, null, 2)}`,
    },
  ],
});

const summary = message.content[0].type === "text" ? message.content[0].text : "";
```

## What OpenPolicy is doing underneath

The flows above look simple from the outside. That's the point — but it's worth being clear about what's actually happening so you understand what you're not building.

Every time your policy changes, OpenPolicy versions the document and records what changed in each section. When you call `changes(userId)`, it looks up which version that user last consented to, computes the diff against your current policy, and filters it to the changes that apply in that user's jurisdiction — across every user, every update, as your policy continues to evolve.

If you were tracking this yourself, you'd eventually have a users-to-versions table, a policy versions table, a diff-computation job, a jurisdiction mapping, and something to keep all of it consistent when you push an update. It's the kind of infrastructure that seems manageable at first and quietly becomes a maintenance problem as your user base grows.

That's what OpenPolicy Plus takes off your plate. The notification experience — when to show it, how to style it, how much to explain — is yours to build.
