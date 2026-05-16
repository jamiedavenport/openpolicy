import { defineScript } from "@openpolicy/core/consent";
import type { ConsentExpr, ScriptDefinition } from "@openpolicy/core/consent";

export type SegmentOptions = {
	writeKey: string;
	requires?: ConsentExpr;
	id?: string;
};

export function segment(opts: SegmentOptions): ScriptDefinition {
	const { writeKey, requires = "analytics", id = "segment" } = opts;
	return defineScript({
		id,
		requires,
		src: `https://cdn.segment.com/analytics.js/v1/${writeKey}/analytics.min.js`,
		queue: [
			"analytics.track",
			"analytics.page",
			"analytics.identify",
			"analytics.group",
			"analytics.alias",
			"analytics.reset",
		],
		init: () => {
			const a = (window as unknown as { analytics: { page: () => void } }).analytics;
			a.page();
		},
	});
}
