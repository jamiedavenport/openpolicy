// Hooks

export { CookiePolicy } from "./components/CookiePolicy";
// Components
export { PolicySection } from "./components/PolicySection";
export { PrivacyPolicy } from "./components/PrivacyPolicy";
export { TermsOfService } from "./components/TermsOfService";
// Context / Provider
export { OpenPolicyProvider as OpenPolicy } from "./context";
export type { UseCookiePolicyResult } from "./hooks/useCookiePolicy";
export { useCookiePolicy } from "./hooks/useCookiePolicy";
export type { UsePrivacyPolicyResult } from "./hooks/usePrivacyPolicy";
export { usePrivacyPolicy } from "./hooks/usePrivacyPolicy";
export type { UseTermsOfServiceResult } from "./hooks/useTermsOfService";
export { useTermsOfService } from "./hooks/useTermsOfService";
// Types
export type { PolicySlots, PolicyTheme } from "./types";
