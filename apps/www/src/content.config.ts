import { defineCollection, z } from "astro:content";

const blog = defineCollection({
	type: "content",
	schema: z.object({
		title: z.string(),
		description: z.string(),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		author: z.string().optional(),
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
