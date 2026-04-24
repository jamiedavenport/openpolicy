import type { OpenPolicyConfig } from "@openpolicy/core";
import {
	defineComponent,
	h,
	type InjectionKey,
	type PropType,
	provide,
	type Ref,
	toRef,
} from "vue";

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

		return () => slots.default?.();
	},
});
