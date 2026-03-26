import {
	acceptAll,
	type CookieConsent,
	type CookiePolicyConfig,
	clearConsent,
	getConsent,
	rejectAll,
	resolveStatus,
	setConsent,
} from "@openpolicy/core";
import { useCallback, useContext, useSyncExternalStore } from "react";
import { OpenPolicyContext } from "../context";

// --- Pure helpers (testable without React) ---

export function acceptAllForConfig(config: CookiePolicyConfig): CookieConsent {
	const consent = acceptAll(config);
	setConsent(consent);
	return consent;
}

export function rejectAllForConfig(): CookieConsent {
	const consent = rejectAll();
	setConsent(consent);
	return consent;
}

export function updateConsent(partial: Partial<CookieConsent>): CookieConsent {
	const current = getConsent() ?? rejectAll();
	const next: CookieConsent = { ...current, ...partial, essential: true };
	setConsent(next);
	return next;
}

// --- Cookie change subscription for useSyncExternalStore ---

type Listener = () => void;
const listeners = new Set<Listener>();

function subscribe(listener: Listener): () => void {
	listeners.add(listener);
	return () => listeners.delete(listener);
}

function notifyListeners(): void {
	for (const l of listeners) l();
}

// Cache the snapshot so useSyncExternalStore gets a stable reference.
// JSON.parse always produces a new object, which would cause infinite re-renders.
let cachedRaw = "";
let cachedValue: CookieConsent | null = null;

export function getSnapshotCached(): CookieConsent | null {
	const raw = document.cookie
		.split("; ")
		.find((c) => c.startsWith("op_consent="));
	const rawStr = raw ?? "";
	if (rawStr === cachedRaw) return cachedValue;
	cachedRaw = rawStr;
	cachedValue = getConsent();
	return cachedValue;
}

function getServerSnapshot(): CookieConsent | null {
	return null;
}

// --- React hook ---

export function useCookieConsent(configProp?: CookiePolicyConfig) {
	const { config: contextConfig } = useContext(OpenPolicyContext);

	const rawConfig = configProp ?? contextConfig ?? undefined;
	const cookieConfig =
		rawConfig && "cookie" in rawConfig && rawConfig.cookie
			? ({
					...rawConfig.cookie,
					company: rawConfig.company,
				} as CookiePolicyConfig)
			: (rawConfig as CookiePolicyConfig | undefined);

	const consent = useSyncExternalStore(
		subscribe,
		getSnapshotCached,
		getServerSnapshot,
	);

	const status = cookieConfig
		? resolveStatus(consent, cookieConfig)
		: consent
			? "custom"
			: "undecided";

	const accept = useCallback(() => {
		if (!cookieConfig) return;
		acceptAllForConfig(cookieConfig);
		notifyListeners();
	}, [cookieConfig]);

	const reject = useCallback(() => {
		rejectAllForConfig();
		notifyListeners();
	}, []);

	const update = useCallback((partial: Partial<CookieConsent>) => {
		updateConsent(partial);
		notifyListeners();
	}, []);

	const reset = useCallback(() => {
		clearConsent();
		notifyListeners();
	}, []);

	return { consent, status, accept, reject, update, reset } as const;
}
