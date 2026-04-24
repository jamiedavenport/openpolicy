import {
	type CookiePolicyConfig,
	compile,
	expandOpenPolicyConfig,
	isOpenPolicyConfig,
	type OpenPolicyConfig,
} from "@openpolicy/core";
import { type CSSProperties, defineComponent, h, inject, type PropType } from "vue";
import { OpenPolicyContextKey } from "../context";
import { renderDocument } from "../render";
import type { PolicyComponents } from "../types";

export const CookiePolicy = defineComponent({
	name: "CookiePolicy",
	props: {
		config: {
			type: Object as PropType<OpenPolicyConfig | CookiePolicyConfig>,
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
				? expandOpenPolicyConfig(config).find((i) => i.type === "cookie")
				: { type: "cookie" as const, ...config };
			if (!input) return null;
			const doc = compile(input);
			return h(
				"div",
				{ "data-op-policy": "", style: props.style },
				renderDocument(doc, props.components) ?? undefined,
			);
		};
	},
});
