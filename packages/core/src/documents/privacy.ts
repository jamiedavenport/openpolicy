import type { PrivacyPolicyConfig } from "../types";
import { bold, heading, li, link, p, section, ul } from "./helpers";
import type { DocumentSection } from "./types";

const RIGHTS_LABELS: Record<string, string> = {
	access: "Right to access your personal data",
	rectification: "Right to correct inaccurate data",
	erasure: "Right to request deletion of your data",
	portability: "Right to receive your data in a portable format",
	restriction: "Right to restrict how we process your data",
	objection: "Right to object to processing",
	opt_out_sale: "Right to opt out of the sale of your personal information",
	non_discrimination:
		"Right to non-discriminatory treatment for exercising your rights",
};

function buildIntroduction(config: PrivacyPolicyConfig): DocumentSection {
	return section("introduction", [
		heading("Introduction"),
		p([
			`This Privacy Policy describes how ${config.company.name} ("we", "us", or "our") collects, uses, and shares information about you when you use our services. Effective Date: ${config.effectiveDate}.`,
		]),
		p([
			`If you have questions about this policy, please contact us at ${config.company.contact}.`,
		]),
	]);
}

function buildChildrenPrivacy(
	config: PrivacyPolicyConfig,
): DocumentSection | null {
	if (!config.children) return null;
	const { underAge, noticeUrl } = config.children;
	return section("children-privacy", [
		heading("Children's Privacy", { reason: "Required by COPPA" }),
		p([
			`Our services are not directed to children under the age of ${underAge}. We do not knowingly collect personal information from children under ${underAge}. If you believe we have collected information from a child, please contact us immediately.`,
		]),
		...(noticeUrl
			? [
					p([
						"For more information, see our ",
						link(noticeUrl, "Children's Privacy Notice"),
						".",
					]),
				]
			: []),
	]);
}

function buildDataCollected(config: PrivacyPolicyConfig): DocumentSection {
	const items = Object.entries(config.dataCollected).map(([category, fields]) =>
		li([bold(category), ul(fields.map((f) => li([f])))]),
	);
	return section("data-collected", [
		heading("Information We Collect"),
		p(["We collect the following categories of information:"]),
		ul(items),
	]);
}

function buildLegalBasis(config: PrivacyPolicyConfig): DocumentSection | null {
	if (!config.jurisdictions.includes("eu")) return null;
	return section("legal-basis", [
		heading("Legal Basis for Processing", {
			reason: "Required by GDPR Article 13",
		}),
		p([config.legalBasis]),
	]);
}

function buildDataRetention(config: PrivacyPolicyConfig): DocumentSection {
	const items = Object.entries(config.retention).map(([category, period]) =>
		li([bold(category), ": ", period]),
	);
	return section("data-retention", [
		heading("Data Retention"),
		p(["We retain your data for the following periods:"]),
		ul(items),
	]);
}

function buildCookies(config: PrivacyPolicyConfig): DocumentSection {
	const enabled: string[] = [];
	if (config.cookies.essential)
		enabled.push("Essential cookies — required for the service to function");
	if (config.cookies.analytics)
		enabled.push(
			"Analytics cookies — help us understand how the service is used",
		);
	if (config.cookies.marketing)
		enabled.push("Marketing cookies — used to deliver relevant advertisements");

	if (enabled.length === 0) {
		return section("cookies", [
			heading("Cookies and Tracking"),
			p(["We do not use cookies or similar tracking technologies."]),
		]);
	}
	return section("cookies", [
		heading("Cookies and Tracking"),
		p(["We use the following types of cookies and tracking technologies:"]),
		ul(enabled.map((e) => li([e]))),
	]);
}

function buildThirdParties(config: PrivacyPolicyConfig): DocumentSection {
	if (config.thirdParties.length === 0) {
		return section("third-parties", [
			heading("Third-Party Services"),
			p([
				"We do not share your personal information with third parties except as required by law.",
			]),
		]);
	}
	return section("third-parties", [
		heading("Third-Party Services"),
		p(["We share data with the following third-party services:"]),
		ul(
			config.thirdParties.map((t) => li([bold(t.name), " \u2014 ", t.purpose])),
		),
	]);
}

function buildUserRights(config: PrivacyPolicyConfig): DocumentSection {
	const items = config.userRights.map((right) => {
		const label = RIGHTS_LABELS[right] ?? right;
		return li([label]);
	});
	return section("user-rights", [
		heading("Your Rights"),
		p(["You have the following rights regarding your personal data:"]),
		ul(items),
	]);
}

function buildGdprSupplement(
	config: PrivacyPolicyConfig,
): DocumentSection | null {
	if (!config.jurisdictions.includes("eu")) return null;
	return section("gdpr-supplement", [
		heading("GDPR Supplemental Disclosures", {
			reason: "Required by GDPR Article 13",
		}),
		p([
			"This section applies to individuals in the European Economic Area (EEA) under the General Data Protection Regulation (GDPR).",
		]),
		p([
			"Data Controller: ",
			bold(config.company.legalName),
			`, ${config.company.address}`,
		]),
		p([
			"In addition to the rights listed above, you have the right to lodge a complaint with your local data protection authority if you believe we have not handled your data in accordance with applicable law.",
		]),
		p([
			"If we transfer your personal data outside the EEA, we ensure adequate safeguards are in place in accordance with GDPR requirements.",
		]),
	]);
}

function buildCcpaSupplement(
	config: PrivacyPolicyConfig,
): DocumentSection | null {
	if (!config.jurisdictions.includes("ca")) return null;
	return section("ccpa-supplement", [
		heading("California Privacy Rights (CCPA)", { reason: "Required by CCPA" }),
		p([
			"If you are a California resident, you have the following additional rights:",
		]),
		ul([
			li([
				"Right to Know — You may request disclosure of the personal information we collect, use, and share about you.",
			]),
			li([
				"Right to Delete — You may request deletion of personal information we have collected about you.",
			]),
			li([
				"Right to Opt-Out — You may opt out of the sale of your personal information.",
			]),
			li([
				"Right to Non-Discrimination — We will not discriminate against you for exercising your CCPA rights.",
			]),
		]),
	]);
}

function buildContact(config: PrivacyPolicyConfig): DocumentSection {
	return section("contact", [
		heading("Contact Us"),
		p(["Contact us:"]),
		ul([
			li([bold("Legal Name: "), config.company.legalName]),
			li([bold("Address: "), config.company.address]),
			li([bold("Email: "), config.company.contact]),
		]),
	]);
}

const SECTION_BUILDERS: ((
	config: PrivacyPolicyConfig,
) => DocumentSection | null)[] = [
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

export function compilePrivacyDocument(
	config: PrivacyPolicyConfig,
): DocumentSection[] {
	return SECTION_BUILDERS.map((builder) => builder(config)).filter(
		(s): s is DocumentSection => s !== null,
	);
}
