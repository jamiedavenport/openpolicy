import type { OpenPolicyConfig } from "@openpolicy/core";
import { defineComponent, type InjectionKey, type PropType, provide, type Ref, toRef } from "vue";

export type OpenPolicyContextValue = {
	config: Ref<OpenPolicyConfig>;
};

export const OpenPolicyContextKey: InjectionKey<OpenPolicyContextValue> =
	Symbol("OpenPolicyContext");

export const OpenPolicy = defineComponent({
	name: "OpenPolicy",
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
