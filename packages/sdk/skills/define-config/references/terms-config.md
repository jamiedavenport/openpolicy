# TermsOfServiceConfig Field Reference

When used inside `defineConfig()`, supply as `terms: Omit<TermsOfServiceConfig, "company">`. `company` lives at the top level of `OpenPolicyConfig`.

## Required fields

| Field | Type | Notes |
|---|---|---|
| `effectiveDate` | `string` | ISO date string. Validation fails if empty. |
| `acceptance` | `{ methods: string[] }` | How users accept — e.g. `["using the service", "creating an account"]`. Warning if `methods` is empty. |
| `governingLaw` | `{ jurisdiction: string }` | **Required.** Validation throws fatal error if `jurisdiction` is absent or empty. |

## Optional sections

All fields below are optional. Include only those that apply to the service. Omitting a field causes the corresponding policy section to be absent from the rendered document.

| Field | Type | Notes |
|---|---|---|
| `eligibility` | `{ minimumAge: number; jurisdictionRestrictions?: string[] }` | Include when service has age or geographic restrictions. |
| `accounts` | `{ registrationRequired: boolean; userResponsibleForCredentials: boolean; companyCanTerminate: boolean }` | Include when the service has user accounts. |
| `prohibitedUses` | `string[]` | List of prohibited use descriptions. e.g. `["Scraping content without permission", "Impersonating other users"]`. |
| `userContent` | `{ usersOwnContent: boolean; licenseGrantedToCompany: boolean; licenseDescription?: string; companyCanRemoveContent: boolean }` | Include when users upload or create content. |
| `intellectualProperty` | `{ companyOwnsService: boolean; usersMayNotCopy: boolean }` | Standard IP clause. |
| `payments` | `{ hasPaidFeatures: boolean; refundPolicy?: string; priceChangesNotice?: string }` | Include when service has paid tiers or subscriptions. |
| `availability` | `{ noUptimeGuarantee: boolean; maintenanceWindows?: string }` | SaaS services typically include this. |
| `termination` | `{ companyCanTerminate: boolean; userCanTerminate: boolean; effectOfTermination?: string }` | Include to describe account closure behavior. |
| `disclaimers` | `{ serviceProvidedAsIs: boolean; noWarranties: boolean }` | Strongly recommended — validation emits a warning if absent. |
| `limitationOfLiability` | `{ excludesIndirectDamages: boolean; liabilityCap?: string }` | Strongly recommended — validation emits a warning if absent. |
| `indemnification` | `{ userIndemnifiesCompany: boolean; scope?: string }` | Include when the service exposes the company to user-generated liability. |
| `thirdPartyServices` | `{ name: string; purpose: string }[]` | Third-party services embedded in the product (note: no `policyUrl` field here, unlike privacy's `thirdParties`). |
| `disputeResolution` | `{ method: DisputeResolutionMethod; venue?: string; classActionWaiver?: boolean }` | Include to specify arbitration or litigation preference. |
| `changesPolicy` | `{ noticeMethod: string; noticePeriodDays?: number }` | Describe how users are notified of ToS changes. |
| `privacyPolicyUrl` | `string` | URL of the privacy policy. Cross-references the privacy document. |

## DisputeResolutionMethod values

| Value | Meaning |
|---|---|
| `"arbitration"` | Binding arbitration |
| `"litigation"` | Court litigation |
| `"mediation"` | Non-binding mediation |

## Validation behavior

- `effectiveDate` empty → fatal error
- `company.*` fields empty → fatal error per field
- `governingLaw.jurisdiction` empty or missing → fatal error
- `acceptance.methods` empty → warning only
- `disclaimers` absent → warning only
- `limitationOfLiability` absent → warning only

Source: `packages/core/src/validate-terms.ts`

## Complete example

```ts
import { defineConfig } from "@openpolicy/sdk";

export default defineConfig({
  company: {
    name: "Acme",
    legalName: "Acme, Inc.",
    address: "123 Main St, San Francisco, CA 94105",
    contact: "legal@acme.com",
  },
  terms: {
    effectiveDate: "2026-01-01",
    acceptance: { methods: ["using the service", "creating an account"] },
    governingLaw: { jurisdiction: "Delaware, USA" },
    eligibility: { minimumAge: 18 },
    accounts: {
      registrationRequired: true,
      userResponsibleForCredentials: true,
      companyCanTerminate: true,
    },
    prohibitedUses: [
      "Scraping content without written permission",
      "Using the service to distribute malware",
      "Impersonating other users or Acme employees",
    ],
    userContent: {
      usersOwnContent: true,
      licenseGrantedToCompany: true,
      licenseDescription: "A worldwide, royalty-free license to host and display your content.",
      companyCanRemoveContent: true,
    },
    intellectualProperty: {
      companyOwnsService: true,
      usersMayNotCopy: true,
    },
    payments: {
      hasPaidFeatures: true,
      refundPolicy: "30-day money-back guarantee on annual plans.",
      priceChangesNotice: "30 days written notice before price changes take effect.",
    },
    availability: {
      noUptimeGuarantee: true,
      maintenanceWindows: "Scheduled maintenance occurs Sundays 02:00–04:00 UTC.",
    },
    termination: {
      companyCanTerminate: true,
      userCanTerminate: true,
      effectOfTermination: "All licenses granted to the user terminate immediately upon account closure.",
    },
    disclaimers: { serviceProvidedAsIs: true, noWarranties: true },
    limitationOfLiability: {
      excludesIndirectDamages: true,
      liabilityCap: "fees paid by the user in the twelve months preceding the claim",
    },
    indemnification: {
      userIndemnifiesCompany: true,
      scope: "Claims arising from user content or user violations of these Terms.",
    },
    thirdPartyServices: [
      { name: "Stripe", purpose: "Payment processing" },
      { name: "AWS", purpose: "Cloud infrastructure" },
    ],
    disputeResolution: {
      method: "arbitration",
      venue: "San Francisco, CA",
      classActionWaiver: true,
    },
    changesPolicy: {
      noticeMethod: "Email notification to the address on your account",
      noticePeriodDays: 30,
    },
    privacyPolicyUrl: "https://acme.com/privacy",
  },
});
```
