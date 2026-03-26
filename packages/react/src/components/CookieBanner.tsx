import {
	type CookieConsent,
	type CookieConsentStatus,
	type CookiePolicyConfig,
	isOpenPolicyConfig,
	type OpenPolicyConfig,
} from "@openpolicy/core";
import { type ReactNode, useContext, useMemo } from "react";
import { OpenPolicyContext } from "../context";
import { useCookieConsent } from "../hooks/useCookieConsent";

interface CookieBannerRenderProps {
	consent: CookieConsent | null;
	status: CookieConsentStatus | "undecided" | "custom";
	accept: () => void;
	reject: () => void;
	update: (partial: Partial<CookieConsent>) => void;
	reset: () => void;
}

interface CookieBannerProps {
	config?: OpenPolicyConfig | CookiePolicyConfig;
	children?: (props: CookieBannerRenderProps) => ReactNode;
	onCustomize?: () => void;
}

function resolveCookieConfig(
	raw: OpenPolicyConfig | CookiePolicyConfig | null | undefined,
): CookiePolicyConfig | undefined {
	if (!raw) return undefined;
	if (isOpenPolicyConfig(raw) && raw.cookie)
		return { ...raw.cookie, company: raw.company } as CookiePolicyConfig;
	if (!isOpenPolicyConfig(raw)) return raw as CookiePolicyConfig;
	return undefined;
}

export function CookieBanner({
	config: configProp,
	children,
	onCustomize,
}: CookieBannerProps) {
	const { config: contextConfig } = useContext(OpenPolicyContext);
	const raw = configProp ?? contextConfig ?? undefined;
	const cookieConfig = useMemo(() => resolveCookieConfig(raw), [raw]);

	const { consent, status, accept, reject, update, reset } =
		useCookieConsent(cookieConfig);

	if (!cookieConfig) return null;
	if (status !== "undecided") return null;

	if (children) {
		return <>{children({ consent, status, accept, reject, update, reset })}</>;
	}

	const showCustomize =
		onCustomize || cookieConfig.consentMechanism?.hasPreferencePanel;

	return (
		<div data-op-cookie-banner role="dialog" aria-label="Cookie consent">
			<p data-op-cookie-banner-text>
				We use cookies to improve your experience.
			</p>
			<div data-op-cookie-banner-actions>
				<button data-op-cookie-banner-accept type="button" onClick={accept}>
					Accept
				</button>
				<button data-op-cookie-banner-reject type="button" onClick={reject}>
					Reject
				</button>
				{showCustomize && (
					<button
						data-op-cookie-banner-customize
						type="button"
						onClick={onCustomize}
					>
						Customize
					</button>
				)}
			</div>
		</div>
	);
}
