// Components

export { ConsentGate } from "./components/ConsentGate";

export { CookiePolicy } from "./components/CookiePolicy";
// Default renderers
export {
	DefaultBold,
	DefaultHeading,
	DefaultLink,
	DefaultList,
	DefaultParagraph,
	DefaultSection,
	DefaultText,
	renderNode,
} from "./components/defaults";
export { PrivacyPolicy } from "./components/PrivacyPolicy";
// Context / Provider
export type { CookieCategory, CookieRoute, HasExpression } from "./context";
// Hooks
export { OpenPolicyProvider as OpenPolicy } from "./context";
export { useCookies } from "./hooks/useCookies";
export { useShouldShowCookieBanner } from "./hooks/useShouldShowCookieBanner";
// Render
export { renderDocument } from "./render";
// Types
export type { PolicyComponents } from "./types";
