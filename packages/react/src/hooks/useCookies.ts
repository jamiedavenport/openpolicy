import { useContext } from "react";
import type { CookieCategory, CookieRoute } from "../context";
import { OpenPolicyContext } from "../context";

export type { CookieCategory, CookieRoute };

export function useCookies() {
	const {
		route,
		setRoute,
		status,
		consent,
		accept,
		rejectAll,
		categories,
		toggle,
		save,
		reset,
		has,
	} = useContext(OpenPolicyContext);

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
