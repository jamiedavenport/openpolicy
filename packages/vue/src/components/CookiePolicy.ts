import type { CookiePolicyConfig, OpenPolicyConfig } from "@openpolicy/core";
import { type CSSProperties, defineComponent, h, type PropType } from "vue";
import { usePolicyDocument } from "../composables/usePolicyDocument";
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
		const doc = usePolicyDocument("cookie", () => props.config);
		return () => {
			if (!doc.value) return null;
			return h(
				"div",
				{ "data-op-policy": "", style: props.style },
				renderDocument(doc.value, props.components) ?? undefined,
			);
		};
	},
});
