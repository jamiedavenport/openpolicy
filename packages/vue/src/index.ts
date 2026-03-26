// Components
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
// Composables
export { useCookieConsent } from "./composables/useCookieConsent";
// Context / Provider
export { OpenPolicyProvider as OpenPolicy } from "./context";
// Render
export { renderDocument } from "./render";
// Styles
export { defaultStyles } from "./styles";
// Types
export type { PolicyComponents, PolicyTheme } from "./types";
