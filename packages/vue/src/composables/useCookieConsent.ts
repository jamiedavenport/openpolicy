import {
	acceptAll,
	type CookieConsent,
	type CookieConsentStatus,
	type CookiePolicyConfig,
	clearConsent,
	getConsent,
	rejectAll,
	resolveStatus,
	setConsent,
} from "@openpolicy/core";
import { inject, onMounted, onUnmounted, type Ref, ref } from "vue";
import { OpenPolicyContextKey } from "../context";

// --- Pure helpers (testable without Vue) ---

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

// --- Vue composable ---

export function useCookieConsent(configProp?: CookiePolicyConfig) {
	const context = inject(OpenPolicyContextKey, null);

	const rawConfig = configProp ?? context?.config.value ?? undefined;
	const cookieConfig: CookiePolicyConfig | undefined =
		rawConfig && "cookie" in rawConfig && rawConfig.cookie
			? ({
					...rawConfig.cookie,
					company: rawConfig.company,
				} as CookiePolicyConfig)
			: (rawConfig as CookiePolicyConfig | undefined);

	const consent: Ref<CookieConsent | null> = ref(null);
	const status: Ref<CookieConsentStatus> = ref("undecided");

	function refresh() {
		consent.value = getConsent();
		status.value = cookieConfig
			? resolveStatus(consent.value, cookieConfig)
			: consent.value
				? "custom"
				: "undecided";
	}

	// Poll for changes (e.g. from other tabs)
	let interval: ReturnType<typeof setInterval> | undefined;
	onMounted(() => {
		refresh();
		interval = setInterval(refresh, 1000);
	});
	onUnmounted(() => {
		if (interval) clearInterval(interval);
	});

	const accept = () => {
		if (!cookieConfig) return;
		acceptAllForConfig(cookieConfig);
		refresh();
	};

	const reject = () => {
		rejectAllForConfig();
		refresh();
	};

	const update = (partial: Partial<CookieConsent>) => {
		updateConsent(partial);
		refresh();
	};

	const reset = () => {
		clearConsent();
		refresh();
	};

	return { consent, status, accept, reject, update, reset } as const;
}
