import {
	acceptAll,
	type CookieConsent,
	type CookieConsentStatus,
	type CookiePolicyConfig,
	isOpenPolicyConfig,
	type OpenPolicyConfig,
	rejectAll,
	resolveStatus,
} from "@openpolicy/core";
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
	useSyncExternalStore,
} from "react";
import { useShouldShowCookieBanner } from "./hooks/useShouldShowCookieBanner";
import { defaultStyles } from "./styles";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CookieRoute = "cookie" | "preferences" | "closed";

export type CookieCategory = {
	key: string;
	label: string;
	enabled: boolean;
	locked: boolean;
};

export type HasExpression =
	| string
	| { and: HasExpression[] }
	| { or: HasExpression[] }
	| { not: HasExpression };

// ─── localStorage helpers ─────────────────────────────────────────────────────

const LS_KEY = "op_consent";

function getConsentFromStorage(): CookieConsent | null {
	try {
		const raw = localStorage.getItem(LS_KEY);
		if (!raw) return null;
		return JSON.parse(raw) as CookieConsent;
	} catch {
		return null;
	}
}

function setConsentToStorage(consent: CookieConsent): void {
	const value: CookieConsent = { ...consent, essential: true };
	localStorage.setItem(LS_KEY, JSON.stringify(value));
}

function clearConsentFromStorage(): void {
	localStorage.removeItem(LS_KEY);
}

// ─── Config resolution ────────────────────────────────────────────────────────

export function resolveCookieConfig(
	raw: OpenPolicyConfig | CookiePolicyConfig | null | undefined,
): CookiePolicyConfig | undefined {
	if (!raw) return undefined;
	if (isOpenPolicyConfig(raw) && raw.cookie)
		return { ...raw.cookie, company: raw.company } as CookiePolicyConfig;
	if (!isOpenPolicyConfig(raw)) return raw as CookiePolicyConfig;
	return undefined;
}

const CATEGORY_LABELS: Record<string, string> = {
	essential: "Essential",
	analytics: "Analytics",
	functional: "Functional",
	marketing: "Marketing",
};

// ─── Pure helpers (exported for tests) ───────────────────────────────────────

export function acceptAllForConfig(config: CookiePolicyConfig): CookieConsent {
	const consent = acceptAll(config);
	setConsentToStorage(consent);
	return consent;
}

export function rejectAllForConfig(config?: CookiePolicyConfig): CookieConsent {
	const consent = rejectAll(config);
	setConsentToStorage(consent);
	return consent;
}

export function updateConsent(partial: Partial<CookieConsent>): CookieConsent {
	const current = getConsentFromStorage() ?? { essential: true };
	const next: CookieConsent = { ...current, ...partial, essential: true };
	setConsentToStorage(next);
	return next;
}

export function evalHas(
	consent: CookieConsent | null,
	expr: HasExpression,
): boolean {
	if (!consent) return false;
	if (typeof expr === "string") return Boolean(consent[expr]);
	if ("and" in expr) return expr.and.every((child) => evalHas(consent, child));
	if ("or" in expr) return expr.or.some((child) => evalHas(consent, child));
	if ("not" in expr) return !evalHas(consent, expr.not);
	return false;
}

// ─── Cookie store ─────────────────────────────────────────────────────────────

type Listener = () => void;
const listeners = new Set<Listener>();

function subscribe(listener: Listener): () => void {
	listeners.add(listener);
	return () => listeners.delete(listener);
}

function notifyListeners(): void {
	for (const l of listeners) l();
}

let cachedRaw = "";
let cachedValue: CookieConsent | null = null;

export function getSnapshotCached(): CookieConsent | null {
	const rawStr = localStorage.getItem(LS_KEY) ?? "";
	if (rawStr === cachedRaw) return cachedValue;
	cachedRaw = rawStr;
	cachedValue = getConsentFromStorage();
	return cachedValue;
}

function getServerSnapshot(): CookieConsent | null {
	return null;
}

// ─── Context ──────────────────────────────────────────────────────────────────

type OpenPolicyContextValue = {
	config: OpenPolicyConfig | null;
	cookieConfig: CookiePolicyConfig | null;
	route: CookieRoute;
	setRoute: (route: CookieRoute) => void;
	status: CookieConsentStatus;
	consent: CookieConsent | null;
	accept: () => void;
	reject: () => void;
	update: (partial: Partial<CookieConsent>) => void;
	reset: () => void;
	has: (expr: HasExpression) => boolean;
	categories: CookieCategory[];
	toggle: (key: string) => void;
	save: (onSave?: (consent: CookieConsent) => void) => void;
	rejectAll: () => void;
};

export const OpenPolicyContext = createContext<OpenPolicyContextValue>({
	config: null,
	cookieConfig: null,
	route: "closed",
	setRoute: () => {},
	status: "undecided",
	consent: null,
	accept: () => {},
	reject: () => {},
	update: () => {},
	reset: () => {},
	has: () => false,
	categories: [],
	toggle: () => {},
	save: () => {},
	rejectAll: () => {},
});

// ─── Provider ─────────────────────────────────────────────────────────────────

type OpenPolicyProviderProps = {
	config: OpenPolicyConfig;
	shouldShow?: () => Promise<boolean>;
	children?: ReactNode;
};

export function OpenPolicyProvider({
	config,
	shouldShow,
	children,
}: OpenPolicyProviderProps) {
	const cookieConfig = useMemo(
		() => resolveCookieConfig(config) ?? null,
		[config],
	);

	const consent = useSyncExternalStore(
		subscribe,
		getSnapshotCached,
		getServerSnapshot,
	);

	const status: CookieConsentStatus = cookieConfig
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

	const has = useCallback(
		(expr: HasExpression) => evalHas(consent, expr),
		[consent],
	);

	const visible = useShouldShowCookieBanner(status, shouldShow);

	const [route, setRoute] = useState<CookieRoute>("closed");
	const [draft, setDraft] = useState<Partial<CookieConsent>>({});

	useEffect(() => {
		if (visible) {
			setRoute((prev) => (prev === "closed" ? "cookie" : prev));
		} else {
			setRoute("closed");
		}
	}, [visible]);

	const rawAccept = useCallback(() => {
		if (!cookieConfig) return;
		acceptAllForConfig(cookieConfig);
		notifyListeners();
	}, [cookieConfig]);

	const rawReject = useCallback(() => {
		rejectAllForConfig(cookieConfig ?? undefined);
		notifyListeners();
	}, [cookieConfig]);

	const update = useCallback((partial: Partial<CookieConsent>) => {
		updateConsent(partial);
		notifyListeners();
	}, []);

	const reset = useCallback(() => {
		clearConsentFromStorage();
		notifyListeners();
	}, []);

	const accept = () => {
		rawAccept();
		setRoute("closed");
	};

	const reject = () => {
		rawReject();
		setRoute("closed");
	};

	const categories: CookieCategory[] = cookieConfig
		? Object.keys(cookieConfig.cookies)
				.filter(
					(key) =>
						cookieConfig.cookies[key as keyof typeof cookieConfig.cookies],
				)
				.map((key) => ({
					key,
					label: CATEGORY_LABELS[String(key)] ?? String(key),
					enabled:
						key === "essential"
							? true
							: (draft[key as keyof CookieConsent] ??
								consent?.[key as keyof CookieConsent] ??
								false),
					locked: key === "essential",
				}))
		: [];

	const toggle = (key: string) => {
		if (key === "essential") return;
		setDraft((prev) => ({
			...prev,
			[key]: !(
				prev[key as keyof CookieConsent] ??
				consent?.[key as keyof CookieConsent] ??
				false
			),
		}));
	};

	const save = (onSave?: (consent: CookieConsent) => void) => {
		const next = {
			...(consent ?? {}),
			...draft,
			essential: true,
		} as CookieConsent;
		update(next);
		setDraft({});
		onSave?.(next);
		setRoute("closed");
	};

	const rejectAllCategories = () => {
		if (!cookieConfig) return;
		const next: CookieConsent = { essential: true };
		for (const key of Object.keys(cookieConfig.cookies)) {
			if (key !== "essential") (next as Record<string, boolean>)[key] = false;
		}
		update(next);
		setDraft({});
		setRoute("closed");
	};

	return (
		<>
			<style href="@openpolicy/react" precedence="default">
				{defaultStyles}
			</style>
			<OpenPolicyContext.Provider
				value={{
					config,
					cookieConfig,
					route,
					setRoute,
					status,
					consent,
					accept,
					reject,
					update,
					reset,
					has,
					categories,
					toggle,
					save,
					rejectAll: rejectAllCategories,
				}}
			>
				{children}
			</OpenPolicyContext.Provider>
		</>
	);
}

// ─── useCookieConsent ─────────────────────────────────────────────────────────

export function useCookieConsent() {
	const { consent, status, accept, reject, update, reset, has } =
		useContext(OpenPolicyContext);
	return { consent, status, accept, reject, update, reset, has } as const;
}
