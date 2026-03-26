import {
	type CookieConsent,
	type CookiePolicyConfig,
	isOpenPolicyConfig,
	type OpenPolicyConfig,
} from "@openpolicy/core";
import { type ReactNode, useContext, useMemo, useState } from "react";
import { OpenPolicyContext } from "../context";
import { useCookieConsent } from "../hooks/useCookieConsent";

export interface CookieCategory {
	key: keyof Omit<CookieConsent, "essential"> | "essential";
	label: string;
	enabled: boolean;
	locked: boolean;
}

interface CookiePreferencePanelRenderProps {
	categories: CookieCategory[];
	toggle: (key: string) => void;
	save: () => void;
	consent: CookieConsent | null;
}

interface CookiePreferencePanelProps {
	config?: OpenPolicyConfig | CookiePolicyConfig;
	open?: boolean;
	onClose?: () => void;
	onSave?: (consent: CookieConsent) => void;
	children?: (props: CookiePreferencePanelRenderProps) => ReactNode;
}

const CATEGORY_LABELS: Record<string, string> = {
	essential: "Essential",
	analytics: "Analytics",
	functional: "Functional",
	marketing: "Marketing",
};

function resolveCookieConfig(
	raw: OpenPolicyConfig | CookiePolicyConfig | null | undefined,
): CookiePolicyConfig | undefined {
	if (!raw) return undefined;
	if (isOpenPolicyConfig(raw) && raw.cookie)
		return { ...raw.cookie, company: raw.company } as CookiePolicyConfig;
	if (!isOpenPolicyConfig(raw)) return raw as CookiePolicyConfig;
	return undefined;
}

export function CookiePreferencePanel({
	config: configProp,
	open,
	onClose,
	onSave,
	children,
}: CookiePreferencePanelProps) {
	const { config: contextConfig } = useContext(OpenPolicyContext);
	const raw = configProp ?? contextConfig ?? undefined;
	const cookieConfig = useMemo(() => resolveCookieConfig(raw), [raw]);

	const { consent, update } = useCookieConsent(cookieConfig);
	const [draft, setDraft] = useState<Partial<CookieConsent>>({});

	if (!cookieConfig) return null;
	if (open === false) return null;

	const categories: CookieCategory[] = (
		Object.keys(cookieConfig.cookies) as Array<
			keyof typeof cookieConfig.cookies
		>
	)
		.filter((key) => cookieConfig.cookies[key])
		.map((key) => ({
			key,
			label: CATEGORY_LABELS[key] ?? key,
			enabled:
				key === "essential" ? true : (draft[key] ?? consent?.[key] ?? false),
			locked: key === "essential",
		}));

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

	const save = () => {
		const next = { ...consent, ...draft, essential: true } as CookieConsent;
		update(next);
		setDraft({});
		onSave?.(next);
		onClose?.();
	};

	if (children) {
		return <>{children({ categories, toggle, save, consent })}</>;
	}

	return (
		<div
			data-op-cookie-preferences
			role="dialog"
			aria-label="Cookie preferences"
		>
			{categories.map((cat) => (
				<fieldset data-op-cookie-category key={cat.key}>
					<legend>{cat.label}</legend>
					<input
						type="checkbox"
						checked={cat.enabled}
						disabled={cat.locked}
						onChange={() => toggle(cat.key)}
					/>
				</fieldset>
			))}
			<button data-op-cookie-preferences-save type="button" onClick={save}>
				Save preferences
			</button>
		</div>
	);
}
