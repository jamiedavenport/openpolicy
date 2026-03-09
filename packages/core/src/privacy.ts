import { renderHTML } from "./renderers/html";
import { renderMarkdown } from "./renderers/markdown";
import { buildCcpaSupplement } from "./templates/privacy/ccpa-supplement";
import { buildChildrenPrivacy } from "./templates/privacy/children-privacy";
import { buildContact } from "./templates/privacy/contact";
import { buildCookies } from "./templates/privacy/cookies";
import { buildDataCollected } from "./templates/privacy/data-collected";
import { buildDataRetention } from "./templates/privacy/data-retention";
import { buildGdprSupplement } from "./templates/privacy/gdpr-supplement";
import { buildIntroduction } from "./templates/privacy/introduction";
import { buildLegalBasis } from "./templates/privacy/legal-basis";
import { buildThirdParties } from "./templates/privacy/third-parties";
import { buildUserRights } from "./templates/privacy/user-rights";
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
