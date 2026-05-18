import { type EnvironmentProviders, makeEnvironmentProviders } from "@angular/core";
import {
	createConsentStore,
	type ConsentStore,
	type PolicyStackConsentConfig,
} from "@policystack/core/consent";
import { OPEN_COOKIES_STORE } from "./tokens";

export type ProvideOpenCookiesOptions =
	| { config: PolicyStackConsentConfig; store?: undefined }
	| { store: ConsentStore; config?: undefined };

export function provideOpenCookies(options: ProvideOpenCookiesOptions): EnvironmentProviders {
	return makeEnvironmentProviders([
		{
			provide: OPEN_COOKIES_STORE,
			useFactory: () => (options.store ? options.store : createConsentStore(options.config)),
		},
	]);
}
