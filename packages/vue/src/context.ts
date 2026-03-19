import type { OpenPolicyConfig } from "@openpolicy/core";
import {
	Fragment,
	type InjectionKey,
	defineComponent,
	h,
	provide,
	type PropType,
	toRef,
	type Ref,
} from "vue";
import { defaultStyles } from "./styles";

interface OpenPolicyContextValue {
	config: Ref<OpenPolicyConfig | null>;
}

export const OpenPolicyContextKey: InjectionKey<OpenPolicyContextValue> =
	Symbol("OpenPolicyContext");

export const OpenPolicyProvider = defineComponent({
	name: "OpenPolicyProvider",
	props: {
		config: {
			type: Object as PropType<OpenPolicyConfig>,
			required: true,
		},
	},
	setup(props, { slots }) {
		provide(OpenPolicyContextKey, {
			config: toRef(props, "config"),
		});

		return () =>
			h(Fragment, [
				h("style", { "data-openpolicy-vue": "" }, defaultStyles),
				slots.default?.(),
			]);
	},
});
