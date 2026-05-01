import { defineCollection, z } from "astro:content";

export const BLOG_TAGS = [
	"announcement",
	"framework",
	"integration",
	"philosophy",
	"engineering",
	"ai",
	"operations",
] as const;
export type BlogTag = (typeof BLOG_TAGS)[number];

const blog = defineCollection({
	type: "content",
	schema: z.object({
		title: z.string(),
		description: z.string(),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		author: z.string().optional(),
		tags: z.array(z.enum(BLOG_TAGS)).default([]),
	}),
});

const frameworks = defineCollection({
	type: "content",
	schema: z.object({
		title: z.string(),
		description: z.string(),
		framework: z.string(),
		icon: z.string(),
		pubDate: z.coerce.date(),
	}),
});

export const collections = { blog, frameworks };
