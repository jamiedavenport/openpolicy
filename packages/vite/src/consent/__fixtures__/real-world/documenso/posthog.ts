import { PostHog } from "posthog-node";

let client: PostHog | null = null;

export function getPostHog(): PostHog | null {
  if (typeof window !== "undefined") return null;
  if (client) return client;
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return null;
  client = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    flushAt: 1,
    flushInterval: 0,
  });
  return client;
}
