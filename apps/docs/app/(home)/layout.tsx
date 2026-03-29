import { Databuddy } from "@databuddy/sdk/react";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { baseOptions } from "@/lib/layout.shared";
import { source } from "@/lib/source";

export default function Layout({ children }: LayoutProps<"/">) {
	return (
		<DocsLayout tree={source.getPageTree()} {...baseOptions()}>
			{children}

			<Databuddy clientId="3d7737d2-b4bb-45a7-b745-06207ec85cfa" />
		</DocsLayout>
	);
}
