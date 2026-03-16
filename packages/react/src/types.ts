import type { PolicySection } from "@openpolicy/core";
import type { ComponentType, ReactNode } from "react";

export type PolicyTheme = Partial<
	Record<
		| "--op-heading-color"
		| "--op-body-color"
		| "--op-section-gap"
		| "--op-font-family"
		| "--op-font-size-heading"
		| "--op-font-size-body"
		| "--op-border-color"
		| "--op-border-radius",
		string
	>
>;

export interface PolicySlots {
	Section?: ComponentType<{
		section: PolicySection;
		children?: ReactNode;
	}>;
	Heading?: ComponentType<{ id: string; children: ReactNode }>;
	Body?: ComponentType<{ body: string }>;
}
