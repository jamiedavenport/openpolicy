import type { Document } from "@openpolicy/core";
import type { ReactNode } from "react";
import {
	DefaultHeading,
	DefaultList,
	DefaultParagraph,
} from "./components/defaults";
import {
	DefaultBold,
	DefaultLink,
	DefaultText,
	InlineComponentsContext,
} from "./inline-context";
import type { PolicyComponents } from "./types";

export function renderDocument(
	doc: Document,
	components: PolicyComponents = {},
): ReactNode {
	const HeadingComp = components.Heading ?? DefaultHeading;
	const ParagraphComp = components.Paragraph ?? DefaultParagraph;
	const ListComp = components.List ?? DefaultList;
	const SectionComp = components.Section;

	const inlineComps = {
		Text: components.Text ?? DefaultText,
		Bold: components.Bold ?? DefaultBold,
		Link: components.Link ?? DefaultLink,
	};

	return (
		<InlineComponentsContext.Provider value={inlineComps}>
			{doc.sections.map((section) => {
				const inner = (
					<>
						<HeadingComp id={section.id}>{section.title}</HeadingComp>
						{section.content.map((node, i) =>
							node.type === "paragraph" ? (
								// biome-ignore lint/suspicious/noArrayIndexKey: content nodes have no stable key
								<ParagraphComp key={i} node={node} />
							) : (
								// biome-ignore lint/suspicious/noArrayIndexKey: content nodes have no stable key
								<ListComp key={i} node={node} />
							),
						)}
					</>
				);
				return SectionComp ? (
					<SectionComp key={section.id} section={section}>
						{inner}
					</SectionComp>
				) : (
					<section key={section.id} data-op-section id={section.id}>
						{inner}
					</section>
				);
			})}
		</InlineComponentsContext.Provider>
	);
}
