import {
	type CookiePolicyConfig,
	isOpenPolicyConfig,
	type OpenPolicyConfig,
} from "@openpolicy/core";
import { defineComponent, h, inject, type PropType } from "vue";
import { useCookieConsent } from "../composables/useCookieConsent";
import { OpenPolicyContextKey } from "../context";

export const CookieBanner = defineComponent({
	name: "CookieBanner",
	props: {
		config: {
			type: Object as PropType<OpenPolicyConfig | CookiePolicyConfig>,
			required: false,
		},
		onCustomize: {
			type: Function as PropType<() => void>,
			required: false,
		},
	},
	setup(props, { slots }) {
		const context = inject(OpenPolicyContextKey, null);

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

			const { consent, status, accept, reject, update, reset } =
				useCookieConsent(cookieConfig);

			if (status.value !== "undecided") return null;

			if (slots.default) {
				return slots.default({
					consent: consent.value,
					status: status.value,
					accept,
					reject,
					update,
					reset,
				});
			}

			const showCustomize =
				props.onCustomize || cookieConfig.consentMechanism?.hasPreferencePanel;

			return h(
				"div",
				{
					"data-op-cookie-banner": "",
					role: "dialog",
					"aria-label": "Cookie consent",
				},
				[
					h(
						"p",
						{ "data-op-cookie-banner-text": "" },
						"We use cookies to improve your experience.",
					),
					h("div", { "data-op-cookie-banner-actions": "" }, [
						h(
							"button",
							{
								"data-op-cookie-banner-accept": "",
								type: "button",
								onClick: accept,
							},
							"Accept",
						),
						h(
							"button",
							{
								"data-op-cookie-banner-reject": "",
								type: "button",
								onClick: reject,
							},
							"Reject",
						),
						showCustomize
							? h(
									"button",
									{
										"data-op-cookie-banner-customize": "",
										type: "button",
										onClick: props.onCustomize,
									},
									"Customize",
								)
							: null,
					]),
				],
			);
		};
	},
});
