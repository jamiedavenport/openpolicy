import { getCollection } from "astro:content";
import fs from "node:fs";
import { Resvg } from "@resvg/resvg-js";
import type { APIRoute } from "astro";
import type { ReactNode } from "react";
import satori from "satori";

export async function getStaticPaths() {
	const posts = await getCollection("blog");
	return posts.map((post) => ({ params: { slug: post.slug } }));
}

const fontData = fs.readFileSync(
	new URL("../../fonts/GeistMono-Bold.woff", import.meta.url),
);

export const GET: APIRoute = async ({ params }) => {
	const posts = await getCollection("blog");
	const post = posts.find((p) => p.slug === params.slug);
	if (!post) return new Response("Not found", { status: 404 });

	const svg = await satori(
		{
			type: "div",
			props: {
				style: {
					width: "100%",
					height: "100%",
					display: "flex",
					flexDirection: "column",
					justifyContent: "space-between",
					backgroundColor: "#ffffff",
					padding: "64px",
					fontFamily: "Geist Mono",
					border: "1px solid #e5e7eb",
				},
				children: [
					{
						type: "div",
						props: {
							style: {
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
							},
							children: [
								{
									type: "span",
									props: {
										style: { fontSize: 14, color: "#6b7280" },
										children: "OPEN-SOURCE POLICY-AS-CODE",
									},
								},
								{
									type: "span",
									props: {
										style: { fontSize: 14, color: "#6b7280" },
										children: post.data.pubDate.toLocaleDateString("en-US", {
											year: "numeric",
											month: "long",
											day: "numeric",
										}),
									},
								},
							],
						},
					},
					{
						type: "div",
						props: {
							style: {
								display: "flex",
								flexDirection: "column",
								gap: 24,
							},
							children: [
								{
									type: "h1",
									props: {
										style: {
											fontSize: 52,
											fontWeight: 700,
											color: "#000000",
											margin: 0,
											lineHeight: 1.2,
										},
										children: post.data.title,
									},
								},
								{
									type: "p",
									props: {
										style: {
											fontSize: 22,
											color: "#6b7280",
											margin: 0,
											lineHeight: 1.5,
										},
										children: post.data.description,
									},
								},
							],
						},
					},
					{
						type: "div",
						props: {
							style: { display: "flex", alignItems: "center", gap: 12 },
							children: [
								{
									type: "span",
									props: {
										style: {
											fontSize: 18,
											fontWeight: 700,
											color: "#000000",
										},
										children: "openpolicy.sh",
									},
								},
							],
						},
					},
				],
			},
		} as unknown as ReactNode,
		{
			width: 1200,
			height: 630,
			fonts: [
				{
					name: "Geist Mono",
					data: fontData,
					weight: 700,
					style: "normal",
				},
			],
		},
	);

	const resvg = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } });
	const png = resvg.render().asPng();

	return new Response(new Uint8Array(png), {
		headers: {
			"Content-Type": "image/png",
			"Cache-Control": "public, max-age=31536000, immutable",
		},
	});
};
