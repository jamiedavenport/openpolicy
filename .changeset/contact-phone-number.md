---
"@openpolicy/sdk": patch
"@openpolicy/core": patch
"@openpolicy/vite": patch
"@openpolicy/cli": patch
"@openpolicy/react": patch
"@openpolicy/vue": patch
"@openpolicy/renderers": patch
---

**Breaking:** `company.contact` is now an object with `email` (required) and an optional `phone` field, replacing the previous email-only string.

```diff
 company: {
   name: "Acme",
   legalName: "Acme Inc.",
   address: "123 Main St",
-  contact: "privacy@acme.com",
+  contact: { email: "privacy@acme.com", phone: "+1-800-555-0100" },
 },
```

CCPA §1798.130(a)(1) requires businesses to provide two or more designated methods for consumers to submit privacy requests, and (unless you operate exclusively online) one must be a toll-free phone number. Setting `company.contact.phone` is now disclosed in:

- The privacy policy **Contact** section (alongside email).
- A new **Submitting requests** subsection inside the CCPA supplement that lists the available submission methods.
- The cookie policy **Contact Us** section.

A new validation warning (`company-contact-phone-recommended`) fires when `jurisdictions` includes `us-ca` and `phone` is unset. It's a warning, not an error — businesses operating exclusively online may omit it.

A new `Contact` type is exported from `@openpolicy/sdk` and `@openpolicy/core`.
