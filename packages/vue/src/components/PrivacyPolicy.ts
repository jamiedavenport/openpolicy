import type { OpenPolicyConfig, PrivacyPolicyConfig } from "@openpolicy/core";
import { type CSSProperties, defineComponent, h, type PropType } from "vue";
import { usePolicyDocument } from "../composables/usePolicyDocument";
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
		const doc = usePolicyDocument("privacy", () => props.config);
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
