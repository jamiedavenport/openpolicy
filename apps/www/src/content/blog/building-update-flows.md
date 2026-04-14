---
title: "Building custom update flows with OpenPolicy Plus"
description: "A look at how to use the OpenPolicy Plus API to build update flows that work for your product and your users."
pubDate: 2026-04-15
author: "OpenPolicy Team"
---

One of the core ideas behind OpenPolicy is that your privacy policy should stay in sync with your product. When you start collecting new data, your policy updates to reflect that.

That's useful, but it introduces a question: how do you keep your users informed without overwhelming them? A one-word change to a data retention clause probably doesn't warrant an email blast to your entire user base. A new section on biometric data collection probably does.

OpenPolicy Plus gives you two primitives to build whatever flow makes sense for your product.

## The API

**`consent(userId)`** records that a user has accepted the current version of your policy. Call it at signup to capture initial acceptance, and again whenever a user reviews and accepts a new version.

```ts
import { client } from "@openpolicy/plus";

await client.consent("user_123");
```

**`changes(userId)`** returns the diff between your current policy and the version that user last consented to.

```ts
import { client } from "@openpolicy/plus";

const changes = await client.changes("user_123");
```

`changes()` is jurisdiction-aware — it only returns changes that are relevant to that user based on where they are. A GDPR-specific update won't show up for a user in California, and vice versa.

Those two calls are the foundation. Everything else is up to you.

## Some examples of what you can build

### Email digest on a cron

The simplest flow: run a job on a schedule, check for users with pending changes, and send them an email with a link back to your app to review and accept.

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

### Human-readable summaries via LLM

The raw diff is useful for building UIs, but it's not always the most readable thing to put in front of a user. You can pipe `changes` into an LLM to generate a plain-language summary in the tone of your product.

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

### In-app banner or modal

Not every update needs an email. For minor changes you might prefer a non-blocking banner the next time the user logs in.

```ts
import { client } from "@openpolicy/plus";

// On session start
const changes = await client.changes(session.userId);

if (changes.length > 0) {
  showPolicyUpdateBanner({ changes, onAccept: () => client.consent(session.userId) });
}
```

### Filtering by significance

You don't have to notify users about every change. The `changes` response gives you enough information to apply your own business logic — only show a prompt when there are more than a handful of changes, or only when specific sections are affected.

```ts
import { client } from "@openpolicy/plus";

const changes = await client.changes("user_123");
const significantChanges = changes.filter((c) => c.section !== "definitions");

if (significantChanges.length >= 3) {
  // prompt the user
}
```

## The part you don't have to build

The flows above are straightforward to put together. What's less obvious is everything OpenPolicy is handling underneath: tracking which version each user consented to, computing the right diff for their jurisdiction, and keeping that state consistent as your policy evolves.

That's the part that's easy to underestimate when you're building it yourself — and the part that OpenPolicy Plus takes off your plate so you can focus on the experience you want to build for your users.
