// Module + global declarations so the fixture corpus type-checks cleanly
// without installing every analytics/cookie SDK.

declare module "js-cookie" {
  const Cookies: {
    set(name: string, value: string, opts?: Record<string, unknown>): void;
    get(name?: string): string | undefined;
    remove(name: string, opts?: Record<string, unknown>): void;
  };
  export default Cookies;
}

declare module "cookies-next" {
  export function setCookie(...args: unknown[]): void;
  export function getCookie(...args: unknown[]): string | undefined;
  export function deleteCookie(...args: unknown[]): void;
}

declare module "nookies" {
  export function setCookie(...args: unknown[]): void;
}

declare module "react-cookie" {
  export function useCookies(
    deps?: string[],
  ): [Record<string, string>, (name: string, value: string, opts?: unknown) => void];
}

declare module "next/headers" {
  type CookieStore = {
    get(name: string): { value: string } | undefined;
    set(name: string, value: string, opts?: unknown): void;
    set(opts: { name: string; value: string; path?: string }): void;
  };
  export function cookies(): Promise<CookieStore> & CookieStore;
}

declare module "next/server" {
  export class NextResponse extends Response {
    static next(): NextResponse;
    cookies: { set(name: string, value: string, opts?: unknown): void };
  }
  export type NextRequest = Request & { headers: Headers };
}

declare module "next/script" {
  const Script: (props: Record<string, unknown>) => unknown;
  export default Script;
}

declare module "next" {
  export type NextApiRequest = unknown;
  export type NextApiResponse = unknown;
}

declare module "posthog-js" {
  const posthog: {
    init(key: string, opts?: Record<string, unknown>): void;
    capture(event: string, props?: unknown): void;
  };
  export default posthog;
}

declare module "posthog-js/react" {
  export const PostHogProvider: (props: Record<string, unknown>) => unknown;
}

declare module "posthog-node" {
  export class PostHog {
    constructor(key: string, opts?: Record<string, unknown>);
  }
}

declare module "@segment/analytics-next" {
  export const AnalyticsBrowser: { load(opts: { writeKey: string }): unknown };
}

declare module "@sentry/nextjs" {
  export function init(opts: Record<string, unknown>): void;
  export function replayIntegration(): unknown;
}

declare module "@sentry/browser" {
  export function init(opts: Record<string, unknown>): void;
}

declare module "some-other-cookies-lib" {
  const Cookies: { set(name: string, value: string): void };
  export default Cookies;
}

declare module "some-cookie-lib" {
  export function cookies(): { set(name: string, value: string): void };
}

declare module "mixpanel-browser" {
  const m: { init(token: string): void };
  export default m;
}

declare const gtag: (...args: unknown[]) => void;
declare const fbq: (...args: unknown[]) => void;
declare const posthog: {
  init(key: string, opts?: Record<string, unknown>): void;
  capture(event: string, props?: unknown): void;
};
declare const ConsentGate: (props: Record<string, unknown>) => unknown;

declare module "react" {
  export type ReactNode = unknown;
  export type ButtonHTMLAttributes<T> = Record<string, unknown> & { children?: ReactNode };
  export type HTMLAttributes<T> = Record<string, unknown> & { children?: ReactNode };
  export function useEffect(fn: () => void, deps?: unknown[]): void;
  export function useState<T>(initial: T): [T, (next: T) => void];
}

declare namespace React {
  type ReactNode = unknown;
}

declare namespace JSX {
  type Element = unknown;
  type IntrinsicElements = Record<string, Record<string, unknown>>;
}
