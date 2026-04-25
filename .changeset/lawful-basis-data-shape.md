---
"@openpolicy/sdk": patch
"@openpolicy/core": patch
"@openpolicy/vite": patch
"@openpolicy/cli": patch
"@openpolicy/react": patch
"@openpolicy/vue": patch
"@openpolicy/renderers": patch
---

**Breaking:** unify lawful basis and retention with their data categories under one symmetric shape; reshape cookies the same way.

`OpenPolicyConfig.legalBasis` and `OpenPolicyConfig.retention` are removed from the top level. They now live inside `data` and are keyed by the same set as `data.collected`, so missing or mismatched keys become a TS error at the `defineConfig` call site (with a runtime validator backstop). `data.lawfulBasis` and `data.retention` are required when `data` is present.

`CookiePolicyCookies` is reshaped from a flat `{ essential: true; [k]: boolean }` map into `{ used: { essential: true; [k]: boolean }; lawfulBasis: { [k]: LegalBasis } }`. Every enabled cookie category requires an Article 6 lawful basis; the rendered "Cookies and Tracking" section appends the basis label to each enabled bullet.

The Vite plugin now also emits a `ScannedCookieKeys` interface augmentation alongside `ScannedCollectionKeys` in `openpolicy.gen.ts`, threading scanned cookie categories through the `defineConfig` generic the same way data categories already are.

**Migration:**

```diff
 export default defineConfig({
   data: {
     collected: { "Account Information": ["Email"] },
     purposes: { "Account Information": "Auth" },
+    lawfulBasis: { "Account Information": LegalBases.Contract },
+    retention: { "Account Information": "Until account deletion" },
   },
-  legalBasis: { "Providing the service": LegalBases.Contract },
-  retention: { "Account data": "Until account deletion" },
   cookies: {
-    essential: true,
-    analytics: false,
+    used: { essential: true, analytics: false },
+    lawfulBasis: { essential: LegalBases.LegalObligation, analytics: LegalBases.Consent },
   },
 });
```
