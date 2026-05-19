import { useEffect } from "react";
import posthog from "posthog-js";
import { PostHogProvider as Provider } from "posthog-js/react";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "", {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
      person_profiles: "identified_only",
      capture_pageview: false,
    });
  }, []);

  return <Provider client={posthog}>{children}</Provider>;
}
