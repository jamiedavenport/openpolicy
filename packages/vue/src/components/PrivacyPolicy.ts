import {
	compile,
	expandOpenPolicyConfig,
	isOpenPolicyConfig,
	type OpenPolicyConfig,
	type PrivacyPolicyConfig,
} from "@openpolicy/core";
import { defineComponent, h, inject, type CSSProperties, type PropType } from "vue";
import { OpenPolicyContextKey } from "../context";
import { renderDocument } from "../render";
import type { PolicyComponents } from "../types";

export const PrivacyPolicy = defineComponent({
	name: "PrivacyPolicy",
	props: {
		config: {
			type: Object as PropType<OpenPolicyConfig | PrivacyPolicyConfig>,
			required: false,
		},
		components: {
			type: Object as PropType<PolicyComponents>,
			required: false,
		},
		style: {
			type: Object as PropType<CSSProperties>,
			required: false,
		},
	},
	setup(props) {
		const context = inject(OpenPolicyContextKey, null);

		return () => {
			const config = props.config ?? context?.config.value ?? undefined;
			if (!config) return null;
			const input = isOpenPolicyConfig(config)
				? expandOpenPolicyConfig(config).find((i) => i.type === "privacy")
				: { type: "privacy" as const, ...config };
			if (!input) return null;
			const doc = compile(input);
			return h(
				"div",
				{ "data-op-policy": "", class: "op-policy", style: props.style },
				renderDocument(doc, props.components) ?? undefined,
			);
		};
	},
});
