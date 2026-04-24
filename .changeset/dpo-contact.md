---
"@openpolicy/core": patch
"@openpolicy/sdk": patch
---

Add optional `company.dpo` for Data Protection Officer contact details, required under GDPR Article 13(1)(b) when a DPO has been appointed.

`Dpo` is a discriminated union: provide `{ email, name?, phone?, address? }` to disclose the appointed officer, or `{ required: false, reason? }` to declare explicitly that no DPO is required. The GDPR and UK-GDPR supplements now render a paragraph covering both cases, and the contact section includes the DPO details when present.

`validateOpenPolicyConfig` emits a warning when `jurisdictions` includes `eu` or `uk` and `company.dpo` is unset — previously the generated policy was silent on DPO, which external GDPR linters flag as a `dpo-contact` violation.

```ts
company: {
  name: "Acme Inc.",
  legalName: "Acme Corporation",
  address: "123 Main St, Springfield, USA",
  contact: "privacy@acme.com",
  dpo: { email: "dpo@acme.com", name: "Jane Doe" },
},
```
