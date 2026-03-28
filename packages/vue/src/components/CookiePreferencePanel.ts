import {
	type CookieConsent,
	type CookiePolicyConfig,
	isOpenPolicyConfig,
	type OpenPolicyConfig,
} from "@openpolicy/core";
import { defineComponent, h, inject, type PropType, ref } from "vue";
import { useCookieConsent } from "../composables/useCookieConsent";
import { OpenPolicyContextKey } from "../context";

export interface CookieCategory {
	key: string;
	label: string;
	enabled: boolean;
	locked: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
	essential: "Essential",
	analytics: "Analytics",
	functional: "Functional",
	marketing: "Marketing",
};

export const CookiePreferencePanel = defineComponent({
	name: "CookiePreferencePanel",
	props: {
		config: {
			type: Object as PropType<OpenPolicyConfig | CookiePolicyConfig>,
			required: false,
		},
		open: {
			type: Boolean as PropType<boolean>,
			required: false,
			default: undefined,
		},
		onClose: {
			type: Function as PropType<() => void>,
			required: false,
		},
		onSave: {
			type: Function as PropType<(consent: CookieConsent) => void>,
			required: false,
		},
	},
	setup(props, { slots }) {
		const context = inject(OpenPolicyContextKey, null);
		const draft = ref<Partial<CookieConsent>>({});

		return () => {
			const raw = props.config ?? context?.config.value ?? undefined;
			if (!raw) return null;

			const cookieConfig: CookiePolicyConfig | undefined =
				isOpenPolicyConfig(raw) && raw.cookie
					? { ...raw.cookie, company: raw.company }
					: !isOpenPolicyConfig(raw)
						? (raw as CookiePolicyConfig)
						: undefined;

			if (!cookieConfig) return null;
			if (props.open === false) return null;

			const { consent, update } = useCookieConsent(cookieConfig);

			const categories: CookieCategory[] = (
				Object.keys(cookieConfig.cookies) as Array<
					keyof typeof cookieConfig.cookies
				>
			)
				.filter((key) => cookieConfig.cookies[key])
				.map((key) => {
					const categoryKey = String(key);
					return {
						key: categoryKey,
						label: CATEGORY_LABELS[categoryKey] ?? categoryKey,
						enabled:
							categoryKey === "essential"
								? true
								: (draft.value[categoryKey] ??
									consent.value?.[categoryKey] ??
									false),
						locked: categoryKey === "essential",
					};
				});

			const toggle = (key: string) => {
				if (key === "essential") return;
				draft.value = {
					...draft.value,
					[key]: !(
						draft.value[key as keyof CookieConsent] ??
						consent.value?.[key as keyof CookieConsent] ??
						false
					),
				};
			};

			const save = () => {
				const next = {
					...consent.value,
					...draft.value,
					essential: true,
				} as CookieConsent;
				update(next);
				draft.value = {};
				props.onSave?.(next);
				props.onClose?.();
			};

			if (slots.default) {
				return slots.default({
					categories,
					toggle,
					save,
					consent: consent.value,
				});
			}

			return h(
				"div",
				{
					"data-op-cookie-preferences": "",
					role: "dialog",
					"aria-label": "Cookie preferences",
				},
				[
					...categories.map((cat) =>
						h("fieldset", { "data-op-cookie-category": "", key: cat.key }, [
							h("legend", cat.label),
							h("input", {
								type: "checkbox",
								checked: cat.enabled,
								disabled: cat.locked,
								onChange: () => toggle(cat.key),
							}),
						]),
					),
					h(
						"button",
						{
							"data-op-cookie-preferences-save": "",
							type: "button",
							onClick: save,
						},
						"Save preferences",
					),
				],
			);
		};
	},
});
