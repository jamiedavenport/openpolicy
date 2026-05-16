import { computed, inject, type Signal } from "@angular/core";
import { ConsentService } from "./consent.service";

export type CategoryRef = {
	granted: Signal<boolean>;
	toggle: () => void;
};

export function injectCategory(key: string): CategoryRef {
	const consent = inject(ConsentService);
	return {
		granted: computed(() => consent.decisions()[key] === true),
		toggle: () => consent.toggle(key),
	};
}
