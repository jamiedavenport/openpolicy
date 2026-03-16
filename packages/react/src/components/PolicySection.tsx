import type { PolicySection as PolicySectionType } from "@openpolicy/core";
import type { PolicySlots } from "../types";

interface PolicySectionProps {
	section: PolicySectionType;
	components?: PolicySlots;
}

export function PolicySection({ section, components }: PolicySectionProps) {
	const SectionComp = components?.Section;
	const HeadingComp = components?.Heading;
	const BodyComp = components?.Body;

	if (SectionComp) {
		return <SectionComp section={section} />;
	}

	return (
		<section data-op-section id={section.id}>
			{HeadingComp ? (
				<HeadingComp id={section.id}>{section.title}</HeadingComp>
			) : (
				<h2 data-op-heading>{section.title}</h2>
			)}
			{BodyComp ? <BodyComp body={section.body} /> : <div data-op-body />}
		</section>
	);
}
