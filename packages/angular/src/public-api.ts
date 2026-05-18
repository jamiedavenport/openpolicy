export { ConsentService } from "./consent.service";
export { injectCategory, type CategoryRef } from "./category";
export { ConsentGate } from "./consent-gate";
export { provideOpenCookies, type ProvideOpenCookiesOptions } from "./provider";
export { OPEN_COOKIES_STORE } from "./tokens";

export type {
	Category,
	ConsentExpr,
	ConsentRecord,
	ConsentRecordSource,
	ConsentState,
	ConsentStore,
	Jurisdiction,
	PolicyStackConsentConfig,
	RepromptReason,
	Route,
} from "@policystack/core/consent";
