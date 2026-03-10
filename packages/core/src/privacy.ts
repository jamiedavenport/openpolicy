import { renderHTML } from "./renderers/html";
import { renderMarkdown } from "./renderers/markdown";
import {
	buildCcpaSupplement,
	buildChildrenPrivacy,
	buildContact,
	buildCookies,
	buildDataCollected,
	buildDataRetention,
	buildGdprSupplement,
	buildIntroduction,
	buildLegalBasis,
	buildThirdParties,
	buildUserRights,
} from "./templates/privacy";
import type {
	CompileOptions,
	OutputFormat,
	PolicySection,
	PrivacyPolicyConfig,
} from "./types";

const SECTION_BUILDERS: ((
	config: PrivacyPolicyConfig,
) => PolicySection | null)[] = [
	buildIntroduction,
	buildChildrenPrivacy,
	buildDataCollected,
	buildLegalBasis,
	buildDataRetention,
	buildCookies,
	buildThirdParties,
	buildUserRights,
	buildGdprSupplement,
	buildCcpaSupplement,
	buildContact,
];

export function compilePrivacyPolicy(
	config: PrivacyPolicyConfig,
	options: CompileOptions = { formats: ["markdown"] },
): { format: OutputFormat; content: string; sections: PolicySection[] }[] {
	const sections = SECTION_BUILDERS.map((builder) => builder(config)).filter(
		(s): s is PolicySection => s !== null,
	);

	return options.formats.map((format) => {
		switch (format) {
			case "markdown":
				return { format, content: renderMarkdown(sections), sections };
			case "html":
				return { format, content: renderHTML(sections), sections };
			case "pdf":
				throw new Error("pdf format is not yet implemented");
			case "jsx":
				throw new Error("jsx format is not yet implemented");
			default:
				throw new Error(`Unsupported format: ${format}`);
		}
	});
}
