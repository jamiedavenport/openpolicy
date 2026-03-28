// Components

export { ConsentGate } from "./components/ConsentGate";
export { CookieBanner } from "./components/CookieBanner";

export { CookiePolicy } from "./components/CookiePolicy";
export type { CookieCategory } from "./components/CookiePreferencePanel";
export { CookiePreferencePanel } from "./components/CookiePreferencePanel";
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
export { TermsOfService } from "./components/TermsOfService";
export { OpenPolicyProvider as OpenPolicy } from "./context";
// Context / Provider
export type { HasExpression } from "./hooks/useCookieConsent";
// Hooks
export { useCookieConsent } from "./hooks/useCookieConsent";
export { useShouldShowCookieBanner } from "./hooks/useShouldShowCookieBanner";
// Render
export { renderDocument } from "./render";
// Styles
export { defaultStyles } from "./styles";
// Types
export type { PolicyComponents, PolicyTheme } from "./types";
