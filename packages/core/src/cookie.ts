import { renderHTML } from "./renderers/html";
import { renderMarkdown } from "./renderers/markdown";
import {
	buildConsent,
	buildContact,
	buildCookieDuration,
	buildCookieTypes,
	buildCookieUsage,
	buildIntroduction,
	buildJurisdiction,
	buildManagingCookies,
	buildThirdPartyCookies,
	buildTrackingTechnologies,
	buildUpdates,
	buildWhatAreCookies,
} from "./templates/cookie";
import type {
	CompileOptions,
	CookiePolicyConfig,
	OutputFormat,
	PolicySection,
} from "./types";

const SECTION_BUILDERS: ((
	config: CookiePolicyConfig,
) => PolicySection | null)[] = [
	buildIntroduction,
	buildWhatAreCookies,
	buildCookieTypes,
	buildTrackingTechnologies,
	buildCookieUsage,
	buildCookieDuration,
	buildConsent,
	buildManagingCookies,
	buildThirdPartyCookies,
	buildJurisdiction,
	buildUpdates,
	buildContact,
];

export function compileCookiePolicy(
	config: CookiePolicyConfig,
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
