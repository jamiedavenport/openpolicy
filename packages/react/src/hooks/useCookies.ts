import { useContext } from "react";
import type { CookieCategory, CookieRoute } from "../context";
import { OpenPolicyContext } from "../context";
import { type HasExpression, useCookieConsent } from "./useCookieConsent";

export type { CookieCategory, CookieRoute };
export type { HasExpression };

export function useCookies() {
	const {
		route,
		setRoute,
		status,
		accept,
		rejectAll,
		categories,
		toggle,
		save,
		reset,
	} = useContext(OpenPolicyContext);
	const { consent, has } = useCookieConsent();

	return {
		status,
		consent,
		categories,
		route,
		has,
		acceptAll: accept,
		acceptNecessary: rejectAll,
		toggle,
		save,
		reset,
		setRoute,
	} as const;
}
