import {
	type CookieConsent,
	type CookieConsentStatus,
	type CookiePolicyConfig,
	isOpenPolicyConfig,
	type OpenPolicyConfig,
} from "@openpolicy/core";
import {
	createContext,
	type ReactNode,
	useEffect,
	useMemo,
	useState,
} from "react";
import { useCookieConsent } from "./hooks/useCookieConsent";
import { useShouldShowCookieBanner } from "./hooks/useShouldShowCookieBanner";
import { defaultStyles } from "./styles";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CookieRoute = "cookie" | "preferences" | "closed";

export type CookieCategory = {
	key: keyof CookieConsent;
	label: string;
	enabled: boolean;
	locked: boolean;
};

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

// ─── Context ──────────────────────────────────────────────────────────────────

type OpenPolicyContextValue = {
	config: OpenPolicyConfig | null;
	cookieConfig: CookiePolicyConfig | null;
	route: CookieRoute;
	setRoute: (route: CookieRoute) => void;
	status: CookieConsentStatus;
	accept: () => void;
	reject: () => void;
	update: (partial: Partial<CookieConsent>) => void;
	reset: () => void;
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
	accept: () => {},
	reject: () => {},
	update: () => {},
	reset: () => {},
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

	const {
		consent,
		status,
		accept: rawAccept,
		reject: rawReject,
		update,
		reset,
	} = useCookieConsent(cookieConfig ?? undefined);

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

	const accept = () => {
		rawAccept();
		setRoute("closed");
	};

	const reject = () => {
		rawReject();
		setRoute("closed");
	};

	const categories: CookieCategory[] = cookieConfig
		? (
				Object.keys(cookieConfig.cookies) as Array<
					keyof typeof cookieConfig.cookies
				>
			)
				.filter((key) => cookieConfig.cookies[key])
				.map((key) => ({
					key,
					label: CATEGORY_LABELS[String(key)] ?? String(key),
					enabled:
						key === "essential"
							? true
							: (draft[key] ?? consent?.[key] ?? false),
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

	const rejectAll = () => {
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
					accept,
					reject,
					update,
					reset,
					categories,
					toggle,
					save,
					rejectAll,
				}}
			>
				{children}
			</OpenPolicyContext.Provider>
		</>
	);
}
