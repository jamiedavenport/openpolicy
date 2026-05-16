import { MDXContent } from "@content-collections/mdx/react";
import { mdxComponents } from "./mdx-components";

export function MdxContent({ code }: { code: string }) {
	return <MDXContent code={code} components={mdxComponents} />;
}
