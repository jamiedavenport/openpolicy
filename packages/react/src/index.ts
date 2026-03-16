// Components
export { CookiePolicy } from "./components/CookiePolicy";
// Default renderers
export {
	DefaultHeading,
	DefaultList,
	DefaultParagraph,
} from "./components/defaults";
export { PrivacyPolicy } from "./components/PrivacyPolicy";
export { TermsOfService } from "./components/TermsOfService";
// Context / Provider
export { OpenPolicyProvider as OpenPolicy } from "./context";
export { DefaultBold, DefaultLink, DefaultText } from "./inline-context";
// Render
export { renderDocument } from "./render";
// Styles
export { defaultStyles } from "./styles";
// Types
export type { PolicyComponents, PolicyTheme } from "./types";
