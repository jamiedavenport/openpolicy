import type { CookiePolicyConfig } from "../types";
import { bold, heading, li, link, p, section, ul } from "./helpers";
import type { DocumentSection } from "./types";

function buildIntroduction(config: CookiePolicyConfig): DocumentSection {
	return section("cookie-introduction", [
		heading("Cookie Policy"),
		p([
			`This Cookie Policy explains how ${config.company.name} ("we", "us", or "our") uses cookies and similar tracking technologies on our services. Effective Date: ${config.effectiveDate}.`,
		]),
	]);
}

function buildWhatAreCookies(): DocumentSection {
	return section("cookie-what-are-cookies", [
		heading("What Are Cookies?"),
		p([
			"Cookies are small text files placed on your device by websites you visit. They are widely used to make websites work more efficiently and to provide information to site owners.",
		]),
		p([
			'Cookies can be "session cookies" (deleted when you close your browser) or "persistent cookies" (remain on your device until they expire or you delete them).',
		]),
	]);
}

function buildTypes(config: CookiePolicyConfig): DocumentSection {
	const types: { label: string; description: string }[] = [];
	if (config.cookies.essential)
		types.push({
			label: "Essential Cookies",
			description:
				"Required for the basic functioning of our services. These cannot be disabled.",
		});
	if (config.cookies.analytics)
		types.push({
			label: "Analytics Cookies",
			description:
				"Help us understand how visitors interact with our services so we can improve them.",
		});
	if (config.cookies.functional)
		types.push({
			label: "Functional Cookies",
			description:
				"Enable enhanced functionality and personalisation, such as remembering your preferences.",
		});
	if (config.cookies.marketing)
		types.push({
			label: "Marketing Cookies",
			description:
				"Used to deliver advertisements more relevant to you and your interests.",
		});

	if (types.length === 0) {
		return section("cookie-types", [
			heading("Types of Cookies We Use"),
			p(["We do not currently use any cookies."]),
		]);
	}

	return section("cookie-types", [
		heading("Types of Cookies We Use"),
		ul(types.map((t) => li([bold(t.label), " \u2014 ", t.description]))),
	]);
}

function buildTrackingTechnologies(
	config: CookiePolicyConfig,
): DocumentSection | null {
	if (!config.trackingTechnologies || config.trackingTechnologies.length === 0)
		return null;
	return section("cookie-tracking-technologies", [
		heading("Other Tracking Technologies"),
		p([
			"In addition to cookies, we may use the following tracking technologies:",
		]),
		ul(config.trackingTechnologies.map((t) => li([t]))),
	]);
}

function buildThirdParties(config: CookiePolicyConfig): DocumentSection | null {
	if (!config.thirdParties || config.thirdParties.length === 0) return null;
	return section("cookie-third-parties", [
		heading("Third-Party Cookies"),
		p(["The following third parties may set cookies through our services:"]),
		ul(
			config.thirdParties.map((t) =>
				li([
					bold(t.name),
					" \u2014 ",
					t.purpose,
					...(t.policyUrl
						? [" (", link(t.policyUrl, "Privacy Policy"), ")"]
						: []),
				]),
			),
		),
	]);
}

function buildConsent(config: CookiePolicyConfig): DocumentSection | null {
	if (!config.consentMechanism) return null;
	const { hasBanner, hasPreferencePanel, canWithdraw } =
		config.consentMechanism;
	const items: string[] = [];
	if (hasBanner)
		items.push(
			"We display a cookie consent banner when you first visit our services.",
		);
	if (hasPreferencePanel)
		items.push(
			"You can manage your cookie preferences at any time via our preference panel.",
		);
	if (canWithdraw)
		items.push(
			"You may withdraw your consent at any time; however, this will not affect the lawfulness of processing based on consent before its withdrawal.",
		);
	if (items.length === 0) return null;
	return section("cookie-consent", [
		heading("Your Consent"),
		ul(items.map((i) => li([i]))),
	]);
}

function buildManaging(): DocumentSection {
	return section("cookie-managing", [
		heading("Managing Cookies"),
		p([
			"Most web browsers allow you to control cookies through their settings. You can:",
		]),
		ul([
			li(["Delete cookies already stored on your device"]),
			li(["Block cookies from being set on your device"]),
			li(["Set your browser to notify you when a cookie is being set"]),
		]),
		p([
			"Please note that restricting cookies may impact the functionality of our services. Consult your browser's help documentation for instructions on managing cookies.",
		]),
	]);
}

function buildJurisdictionEu(
	config: CookiePolicyConfig,
): DocumentSection | null {
	if (!config.jurisdictions.includes("eu")) return null;
	return section("cookie-jurisdiction-eu", [
		heading("European Users (GDPR)", {
			reason: "Required under ePrivacy Directive and GDPR",
		}),
		p([
			"If you are located in the European Economic Area, we rely on your consent as our legal basis for setting non-essential cookies. You have the right to withdraw consent at any time.",
		]),
		p([
			"Essential cookies are set on the basis of our legitimate interests to provide you with a functioning service.",
		]),
	]);
}

function buildContact(config: CookiePolicyConfig): DocumentSection {
	return section("cookie-contact", [
		heading("Contact Us"),
		p(["If you have questions about this Cookie Policy, please contact us:"]),
		ul([
			li([bold("Legal Name: "), config.company.legalName]),
			li([bold("Address: "), config.company.address]),
			li([bold("Email: "), config.company.contact]),
		]),
	]);
}

const SECTION_BUILDERS: ((
	config: CookiePolicyConfig,
) => DocumentSection | null)[] = [
	buildIntroduction,
	() => buildWhatAreCookies(),
	buildTypes,
	buildTrackingTechnologies,
	buildThirdParties,
	buildConsent,
	() => buildManaging(),
	buildJurisdictionEu,
	buildContact,
];

export function compileCookieDocument(
	config: CookiePolicyConfig,
): DocumentSection[] {
	return SECTION_BUILDERS.map((builder) => builder(config)).filter(
		(s): s is DocumentSection => s !== null,
	);
}
