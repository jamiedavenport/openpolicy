import type { Document } from "@openpolicy/core";
import type { VNodeChild } from "vue";
import { renderNode } from "./components/defaults";
import type { PolicyComponents } from "./types";

export function renderDocument(
	doc: Document,
	components: PolicyComponents = {},
): VNodeChild {
	return renderNode(doc, components);
}
