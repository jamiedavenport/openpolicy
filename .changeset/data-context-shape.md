---
"@openpolicy/sdk": patch
"@openpolicy/core": patch
"@openpolicy/vite": patch
"@openpolicy/cli": patch
"@openpolicy/react": patch
"@openpolicy/vue": patch
"@openpolicy/renderers": patch
---

**Breaking:** consolidate per-category metadata into `data.context` and `cookies.context`.

`data.purposes`, `data.lawfulBasis`, `data.retention`, and `data.provisionRequirement` are replaced by a single `data.context` map keyed by category. Each entry carries `purpose`, `lawfulBasis`, `retention`, and `provision`. The same applies to cookies: `cookies.lawfulBasis` becomes `cookies.context[key].lawfulBasis`.

New `provision` helpers — `Statutory()`, `Contractual()`, `ContractPrerequisite()`, `Voluntary()` — replace the verbose `{ basis, consequences }` literal.

Migration:

```diff
 data: {
   collected: { "Account Information": ["Name", "Email"] },
-  purposes: { "Account Information": "To create accounts" },
-  lawfulBasis: { "Account Information": LegalBases.Contract },
-  retention: { "Account Information": "Until account deletion" },
-  provisionRequirement: {
-    "Account Information": { basis: "contract-prerequisite", consequences: "We cannot create your account." },
-  },
+  context: {
+    "Account Information": {
+      purpose: "To create accounts",
+      lawfulBasis: LegalBases.Contract,
+      retention: "Until account deletion",
+      provision: ContractPrerequisite("We cannot create your account."),
+    },
+  },
 },
 cookies: {
   used: { essential: true, analytics: true },
-  lawfulBasis: {
-    essential: LegalBases.LegalObligation,
-    analytics: LegalBases.Consent,
-  },
+  context: {
+    essential: { lawfulBasis: LegalBases.LegalObligation },
+    analytics: { lawfulBasis: LegalBases.Consent },
+  },
 },
```

Each category name is now typed twice (once in `collected`, once in `context`) instead of five times. The Vite auto-collect plugin is unchanged: scanned categories must still appear in `data.context` / `cookies.context`, enforced via `ScannedCollectionKeys` / `ScannedCookieKeys` in `openpolicy.gen.ts`.
