import {
	acceptAll,
	type CookieConsent,
	type CookiePolicyConfig,
	clearConsent,
	getConsent,
	isOpenPolicyConfig,
	rejectAll,
	resolveStatus,
	setConsent,
} from "@openpolicy/core";
import {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useSyncExternalStore,
} from "react";
import { OpenPolicyContext } from "../context";

export type HasExpression =
	| string
	| { and: HasExpression[] }
	| { or: HasExpression[] }
	| { not: HasExpression };

// --- Pure helpers (testable without React) ---

export function acceptAllForConfig(config: CookiePolicyConfig): CookieConsent {
	const consent = acceptAll(config);
	setConsent(consent);
	return consent;
}

export function rejectAllForConfig(config?: CookiePolicyConfig): CookieConsent {
	const consent = rejectAll(config);
	setConsent(consent);
	return consent;
}

export function updateConsent(partial: Partial<CookieConsent>): CookieConsent {
	const current = getConsent() ?? { essential: true };
	const next: CookieConsent = { ...current, ...partial, essential: true };
	setConsent(next);
	return next;
}

function evalHas(consent: CookieConsent | null, expr: HasExpression): boolean {
	if (!consent) return false;
	if (typeof expr === "string") return Boolean(consent[expr]);
	if ("and" in expr) return expr.and.every((child) => evalHas(consent, child));
	if ("or" in expr) return expr.or.some((child) => evalHas(consent, child));
	if ("not" in expr) return !evalHas(consent, expr.not);
	return false;
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

	const cookieConfig = useMemo(() => {
		const raw = configProp ?? contextConfig ?? undefined;
		if (!raw) return undefined;
		if (isOpenPolicyConfig(raw) && raw.cookie)
			return {
				...raw.cookie,
				company: raw.company,
			} as CookiePolicyConfig;
		if (!isOpenPolicyConfig(raw)) return raw as CookiePolicyConfig;
		return undefined;
	}, [configProp, contextConfig]);

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

	// Sync data attributes on document.body for CSS hooks
	useEffect(() => {
		const body = document.body;
		if (status) body.dataset.status = status;
		if (cookieConfig) {
			for (const key of Object.keys(cookieConfig.cookies)) {
				const value = consent ? (consent[key] ?? false) : false;
				body.setAttribute(`data-consent-${key}`, String(Boolean(value)));
			}
		}
		return () => {
			if (body.dataset.status === status) delete body.dataset.status;
			if (cookieConfig) {
				for (const key of Object.keys(cookieConfig.cookies)) {
					body.removeAttribute(`data-consent-${key}`);
				}
			}
		};
	}, [consent, cookieConfig, status]);

	const accept = useCallback(() => {
		if (!cookieConfig) return;
		acceptAllForConfig(cookieConfig);
		notifyListeners();
	}, [cookieConfig]);

	const reject = useCallback(() => {
		rejectAllForConfig(cookieConfig);
		notifyListeners();
	}, [cookieConfig]);

	const update = useCallback((partial: Partial<CookieConsent>) => {
		updateConsent(partial);
		notifyListeners();
	}, []);

	const reset = useCallback(() => {
		clearConsent();
		notifyListeners();
	}, []);

	const has = useCallback(
		(expr: HasExpression) => evalHas(consent, expr),
		[consent],
	);

	return { consent, status, accept, reject, update, reset, has } as const;
}
