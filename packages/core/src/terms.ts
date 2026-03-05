import { renderHTML } from "./renderers/html";
import { renderMarkdown } from "./renderers/markdown";
import { buildAcceptance } from "./templates/terms/acceptance";
import { buildAccounts } from "./templates/terms/accounts";
import { buildAvailability } from "./templates/terms/availability";
import { buildChangesToTerms } from "./templates/terms/changes-to-terms";
import { buildContact } from "./templates/terms/contact";
import { buildDisclaimers } from "./templates/terms/disclaimers";
import { buildDisputeResolution } from "./templates/terms/dispute-resolution";
import { buildEligibility } from "./templates/terms/eligibility";
import { buildGoverningLaw } from "./templates/terms/governing-law";
import { buildIndemnification } from "./templates/terms/indemnification";
import { buildIntellectualProperty } from "./templates/terms/intellectual-property";
import { buildIntroduction } from "./templates/terms/introduction";
import { buildLimitationOfLiability } from "./templates/terms/limitation-of-liability";
import { buildPayments } from "./templates/terms/payments";
import { buildProhibitedUse } from "./templates/terms/prohibited-use";
import { buildTermination } from "./templates/terms/termination";
import { buildThirdPartyServices } from "./templates/terms/third-party-services";
import { buildUserContent } from "./templates/terms/user-content";
import type {
	CompileOptions,
	OutputFormat,
	PolicySection,
	TermsOfServiceConfig,
} from "./types";

const SECTION_BUILDERS: ((
	config: TermsOfServiceConfig,
) => PolicySection | null)[] = [
	buildIntroduction,
	buildAcceptance,
	buildEligibility,
	buildAccounts,
	buildProhibitedUse,
	buildUserContent,
	buildIntellectualProperty,
	buildPayments,
	buildAvailability,
	buildTermination,
	buildDisclaimers,
	buildLimitationOfLiability,
	buildIndemnification,
	buildThirdPartyServices,
	buildDisputeResolution,
	buildGoverningLaw,
	buildChangesToTerms,
	buildContact,
];

export function compileTermsOfService(
	config: TermsOfServiceConfig,
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
