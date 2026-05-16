import { ogMeta } from "@jxdltd/tanstack/og/router";

export const SITE_URL = "https://policystack.dev";
export const SITE_NAME = "PolicyStack";

type PageMetaInput = {
	title: string;
	description: string;
	path: string;
	type?: "website" | "article";
	publishedTime?: string;
};

type HeadCtx = Parameters<typeof ogMeta>[0];

export function pageMeta(
	{ title, description, path, type = "website", publishedTime }: PageMetaInput,
	ctx: HeadCtx,
) {
	const url = `${SITE_URL}${path}`;

	const meta: Array<Record<string, string>> = [
		{ title },
		{ name: "description", content: description },

		{ property: "og:type", content: type },
		{ property: "og:site_name", content: SITE_NAME },
		{ property: "og:title", content: title },
		{ property: "og:description", content: description },
		{ property: "og:url", content: url },

		{ name: "twitter:title", content: title },
		{ name: "twitter:description", content: description },

		...ogMeta(ctx, { siteName: SITE_NAME, siteUrl: SITE_URL }),
	];

	if (type === "article" && publishedTime) {
		meta.push({ property: "article:published_time", content: publishedTime });
	}

	return {
		meta,
		links: [{ rel: "canonical", href: url }],
	};
}
