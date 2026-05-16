import type { ShikiTransformer } from "@shikijs/types";

type ChromeMeta = { file?: string; tag?: string };

export function parseChromeMeta(metaString: string | null | undefined): ChromeMeta {
	if (!metaString) return {};
	const meta: ChromeMeta = {};
	const file = metaString.match(/file=(?:"([^"]+)"|(\S+))/);
	const tag = metaString.match(/tag=(?:"([^"]+)"|(\S+))/);
	if (file) meta.file = file[1] ?? file[2];
	if (tag) meta.tag = tag[1] ?? tag[2];
	return meta;
}

export const shikiChromeTransformer: ShikiTransformer = {
	name: "codeblock-chrome",
	pre(node) {
		const meta = (this.options.meta ?? {}) as ChromeMeta;
		node.properties ??= {};
		if (meta.file) node.properties["data-file"] = meta.file;
		if (meta.tag) node.properties["data-tag"] = meta.tag;
	},
};
