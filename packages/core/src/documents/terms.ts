import type { TermsOfServiceConfig } from "../types";
import { bold, heading, li, p, section, ul } from "./helpers";
import type { DocumentSection } from "./types";

function buildIntroduction(config: TermsOfServiceConfig): DocumentSection {
	return section("tos-introduction", [
		heading("Terms of Service"),
		p([
			`These Terms of Service ("Terms") govern your use of services provided by ${config.company.name} ("we", "us", or "our"). By using our services, you agree to these Terms. Effective Date: ${config.effectiveDate}.`,
		]),
	]);
}

function buildAcceptance(config: TermsOfServiceConfig): DocumentSection {
	return section("tos-acceptance", [
		heading("Acceptance of Terms"),
		p(["You accept these Terms by:"]),
		ul(config.acceptance.methods.map((m) => li([m]))),
	]);
}

function buildEligibility(
	config: TermsOfServiceConfig,
): DocumentSection | null {
	if (!config.eligibility) return null;
	const { minimumAge, jurisdictionRestrictions } = config.eligibility;
	return section("tos-eligibility", [
		heading("Eligibility"),
		p([
			`You must be at least ${minimumAge} years old to use our services. By using the services, you represent that you meet this age requirement.`,
		]),
		...(jurisdictionRestrictions && jurisdictionRestrictions.length > 0
			? [
					p(["Our services are not available in the following jurisdictions:"]),
					ul(jurisdictionRestrictions.map((j) => li([j]))),
				]
			: []),
	]);
}

function buildAccounts(config: TermsOfServiceConfig): DocumentSection | null {
	if (!config.accounts) return null;
	const {
		registrationRequired,
		userResponsibleForCredentials,
		companyCanTerminate,
	} = config.accounts;
	const items: string[] = [];
	if (registrationRequired)
		items.push(
			"Registration is required to access certain features of our services.",
		);
	if (userResponsibleForCredentials)
		items.push(
			"You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account.",
		);
	if (companyCanTerminate)
		items.push(
			"We reserve the right to terminate or suspend accounts at our discretion.",
		);
	return section("tos-accounts", [
		heading("Accounts"),
		ul(items.map((i) => li([i]))),
	]);
}

function buildProhibitedUses(
	config: TermsOfServiceConfig,
): DocumentSection | null {
	if (!config.prohibitedUses || config.prohibitedUses.length === 0) return null;
	return section("tos-prohibited-uses", [
		heading("Prohibited Uses"),
		p(["You may not use our services for the following purposes:"]),
		ul(config.prohibitedUses.map((u) => li([u]))),
	]);
}

function buildUserContent(
	config: TermsOfServiceConfig,
): DocumentSection | null {
	if (!config.userContent) return null;
	const {
		usersOwnContent,
		licenseGrantedToCompany,
		licenseDescription,
		companyCanRemoveContent,
	} = config.userContent;
	const items: string[] = [];
	if (usersOwnContent)
		items.push("You retain ownership of content you submit to our services.");
	if (licenseGrantedToCompany)
		items.push(
			licenseDescription ??
				"By submitting content, you grant us a license to use, reproduce, and display that content in connection with our services.",
		);
	if (companyCanRemoveContent)
		items.push(
			"We reserve the right to remove content that violates these Terms or that we find objectionable.",
		);
	return section("tos-user-content", [
		heading("User Content"),
		ul(items.map((i) => li([i]))),
	]);
}

function buildIntellectualProperty(
	config: TermsOfServiceConfig,
): DocumentSection | null {
	if (!config.intellectualProperty) return null;
	const { companyOwnsService, usersMayNotCopy } = config.intellectualProperty;
	const items: string[] = [];
	if (companyOwnsService)
		items.push(
			`All content, features, and functionality of our services are owned by ${config.company.name} and are protected by intellectual property laws.`,
		);
	if (usersMayNotCopy)
		items.push(
			"You may not copy, modify, distribute, sell, or lease any part of our services without our express written permission.",
		);
	return section("tos-intellectual-property", [
		heading("Intellectual Property"),
		ul(items.map((i) => li([i]))),
	]);
}

function buildPayments(config: TermsOfServiceConfig): DocumentSection | null {
	if (!config.payments) return null;
	const { hasPaidFeatures, refundPolicy, priceChangesNotice } = config.payments;
	const items: string[] = [];
	if (hasPaidFeatures)
		items.push("Some features of our services require payment.");
	if (refundPolicy) items.push(refundPolicy);
	if (priceChangesNotice) items.push(priceChangesNotice);
	if (items.length === 0) return null;
	return section("tos-payments", [
		heading("Payments"),
		ul(items.map((i) => li([i]))),
	]);
}

function buildAvailability(
	config: TermsOfServiceConfig,
): DocumentSection | null {
	if (!config.availability) return null;
	const { noUptimeGuarantee, maintenanceWindows } = config.availability;
	const items: string[] = [];
	if (noUptimeGuarantee)
		items.push(
			"We do not guarantee uninterrupted or error-free access to our services.",
		);
	if (maintenanceWindows) items.push(maintenanceWindows);
	return section("tos-availability", [
		heading("Service Availability"),
		ul(items.map((i) => li([i]))),
	]);
}

function buildTermination(
	config: TermsOfServiceConfig,
): DocumentSection | null {
	if (!config.termination) return null;
	const { companyCanTerminate, userCanTerminate, effectOfTermination } =
		config.termination;
	const items: string[] = [];
	if (companyCanTerminate)
		items.push(
			"We may terminate or suspend your access to our services at any time, with or without cause or notice.",
		);
	if (userCanTerminate)
		items.push("You may terminate your use of our services at any time.");
	if (effectOfTermination) items.push(effectOfTermination);
	return section("tos-termination", [
		heading("Termination"),
		ul(items.map((i) => li([i]))),
	]);
}

function buildDisclaimers(
	config: TermsOfServiceConfig,
): DocumentSection | null {
	if (!config.disclaimers) return null;
	const { serviceProvidedAsIs, noWarranties } = config.disclaimers;
	const items: string[] = [];
	if (serviceProvidedAsIs)
		items.push(
			'Our services are provided on an "as is" and "as available" basis.',
		);
	if (noWarranties)
		items.push(
			"We make no warranties, express or implied, regarding the reliability, accuracy, or fitness for a particular purpose of our services.",
		);
	return section("tos-disclaimers", [
		heading("Disclaimers"),
		ul(items.map((i) => li([i]))),
	]);
}

function buildLimitationOfLiability(
	config: TermsOfServiceConfig,
): DocumentSection | null {
	if (!config.limitationOfLiability) return null;
	const { excludesIndirectDamages, liabilityCap } =
		config.limitationOfLiability;
	const items: string[] = [];
	if (excludesIndirectDamages)
		items.push(
			"To the fullest extent permitted by law, we shall not be liable for any indirect, incidental, special, or consequential damages.",
		);
	if (liabilityCap) items.push(liabilityCap);
	return section("tos-limitation-of-liability", [
		heading("Limitation of Liability"),
		ul(items.map((i) => li([i]))),
	]);
}

function buildIndemnification(
	config: TermsOfServiceConfig,
): DocumentSection | null {
	if (!config.indemnification) return null;
	const { userIndemnifiesCompany, scope } = config.indemnification;
	if (!userIndemnifiesCompany) return null;
	return section("tos-indemnification", [
		heading("Indemnification"),
		p([
			scope ??
				`You agree to indemnify and hold harmless ${config.company.name} and its officers, directors, employees, and agents from any claims arising out of your use of the services or violation of these Terms.`,
		]),
	]);
}

function buildThirdPartyServices(
	config: TermsOfServiceConfig,
): DocumentSection | null {
	if (!config.thirdPartyServices || config.thirdPartyServices.length === 0)
		return null;
	return section("tos-third-party-services", [
		heading("Third-Party Services"),
		p(["Our services may integrate with or link to third-party services:"]),
		ul(
			config.thirdPartyServices.map((t) =>
				li([bold(t.name), " \u2014 ", t.purpose]),
			),
		),
	]);
}

function buildDisputeResolution(
	config: TermsOfServiceConfig,
): DocumentSection | null {
	if (!config.disputeResolution) return null;
	const { method, venue, classActionWaiver } = config.disputeResolution;
	const items: string[] = [];
	const methodLabel =
		method === "arbitration"
			? "binding arbitration"
			: method === "mediation"
				? "mediation"
				: "litigation";
	items.push(
		`Any disputes arising from these Terms or your use of our services shall be resolved through ${methodLabel}.`,
	);
	if (venue) items.push(`Venue: ${venue}.`);
	if (classActionWaiver)
		items.push(
			"You waive any right to participate in class action lawsuits or class-wide arbitration.",
		);
	return section("tos-dispute-resolution", [
		heading("Dispute Resolution"),
		ul(items.map((i) => li([i]))),
	]);
}

function buildGoverningLaw(config: TermsOfServiceConfig): DocumentSection {
	return section("tos-governing-law", [
		heading("Governing Law"),
		p([
			`These Terms are governed by the laws of ${config.governingLaw.jurisdiction}, without regard to conflict of law principles.`,
		]),
	]);
}

function buildChanges(config: TermsOfServiceConfig): DocumentSection | null {
	if (!config.changesPolicy) return null;
	const { noticeMethod, noticePeriodDays } = config.changesPolicy;
	const notice = noticePeriodDays
		? `at least ${noticePeriodDays} days' notice via ${noticeMethod}`
		: `notice via ${noticeMethod}`;
	return section("tos-changes", [
		heading("Changes to These Terms"),
		p([
			`We may update these Terms from time to time. We will provide ${notice} before changes take effect. Continued use of our services after changes constitutes acceptance of the revised Terms.`,
		]),
	]);
}

function buildContact(config: TermsOfServiceConfig): DocumentSection {
	return section("tos-contact", [
		heading("Contact Us"),
		p(["If you have questions about these Terms, please contact us:"]),
		ul([
			li([bold("Legal Name: "), config.company.legalName]),
			li([bold("Address: "), config.company.address]),
			li([bold("Email: "), config.company.contact]),
		]),
	]);
}

const SECTION_BUILDERS: ((
	config: TermsOfServiceConfig,
) => DocumentSection | null)[] = [
	buildIntroduction,
	buildAcceptance,
	buildEligibility,
	buildAccounts,
	buildProhibitedUses,
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
	buildChanges,
	buildContact,
];

export function compileTermsDocument(
	config: TermsOfServiceConfig,
): DocumentSection[] {
	return SECTION_BUILDERS.map((builder) => builder(config)).filter(
		(s): s is DocumentSection => s !== null,
	);
}
