# OpenPolicy — Skill Spec

OpenPolicy is a policy-as-code library for TypeScript applications. Developers describe their privacy policy, terms of service, and cookie policy as structured TypeScript configs using `defineConfig()`, then render them at runtime via React components. Data collection points and third-party dependencies are annotated in source code and auto-populated into the config at build time via the `autoCollect()` Vite plugin.

## Domains

| Domain                | Description                                                                                    | Skills                                           |
| --------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Setup                 | Installing packages, wiring the Vite plugin, and wrapping the app with the OpenPolicy provider | getting-started, vite-setup                      |
| Authoring Policies    | Writing and maintaining the defineConfig() object                                              | define-config, migrate                           |
| Annotating Collection | Marking data collection and third-party usage in source code                                   | annotate-data-collection, annotate-third-parties |
| Rendering in React    | Displaying policy documents and managing cookie consent                                        | render-policies, cookie-banner                   |

## Skill Inventory

| Skill                    | Type      | Domain            | What it covers                                                         | Failure modes |
| ------------------------ | --------- | ----------------- | ---------------------------------------------------------------------- | ------------- |
| getting-started          | lifecycle | setup             | Install, vite.config.ts, openpolicy.ts, provider wrap, first render    | 3             |
| define-config            | core      | policy-definition | OpenPolicyConfig shape, all fields, jurisdictions, presets             | 3             |
| vite-setup               | framework | setup             | autoCollect() options, srcDir, usePackageJson, hot reload              | 2             |
| annotate-data-collection | core      | annotation        | collecting(), dataCollected sentinel, DataCategories presets           | 3             |
| annotate-third-parties   | core      | annotation        | thirdParty(), thirdParties sentinel, usePackageJson, KNOWN_PACKAGES    | 3             |
| render-policies          | framework | rendering         | PrivacyPolicy, TermsOfService, CookiePolicy, provider, shadcn registry | 3             |
| cookie-banner            | framework | rendering         | useCookies(), route state, acceptAll/reject, ConsentGate, preferences  | 3             |
| migrate                  | lifecycle | policy-definition | Mapping prose to structured fields, optional sections                  | 2             |

## Failure Mode Inventory

### getting-started (3 failure modes)

| #   | Mistake                                                  | Priority | Source                             | Cross-skill?                               |
| --- | -------------------------------------------------------- | -------- | ---------------------------------- | ------------------------------------------ |
| 1   | Using openPolicy() vite plugin instead of autoCollect()  | CRITICAL | maintainer interview               | vite-setup, render-policies, cookie-banner |
| 2   | Forgetting to wrap app with \<OpenPolicy\> provider      | HIGH     | packages/react/src/context.tsx     | —                                          |
| 3   | Not spreading dataCollected and thirdParties into config | HIGH     | packages/sdk/src/auto-collected.ts | —                                          |

### define-config (3 failure modes)

| #   | Mistake                                                                 | Priority | Source                               | Cross-skill? |
| --- | ----------------------------------------------------------------------- | -------- | ------------------------------------ | ------------ |
| 1   | Using standalone PrivacyPolicyConfig instead of nested OpenPolicyConfig | HIGH     | packages/core/src/types.ts           | —            |
| 2   | Omitting governingLaw from terms of service                             | HIGH     | packages/core/src/validate-terms.ts  | —            |
| 3   | Not specifying jurisdictions for GDPR/CCPA compliance fields            | MEDIUM   | packages/core/src/templates/privacy/ | —            |

### vite-setup (2 failure modes)

| #   | Mistake                                                       | Priority | Source                                 | Cross-skill?    |
| --- | ------------------------------------------------------------- | -------- | -------------------------------------- | --------------- |
| 1   | Using openPolicy() instead of autoCollect() in vite.config.ts | CRITICAL | maintainer interview                   | getting-started |
| 2   | Expecting autoCollect to scan files outside default srcDir    | MEDIUM   | packages/vite-auto-collect/src/scan.ts | —               |

### annotate-data-collection (3 failure modes)

| #   | Mistake                                                 | Priority | Source                                    | Cross-skill? |
| --- | ------------------------------------------------------- | -------- | ----------------------------------------- | ------------ |
| 1   | Using dynamic values in collecting() category or labels | HIGH     | packages/vite-auto-collect/src/analyse.ts | —            |
| 2   | Not importing and spreading dataCollected into config   | HIGH     | packages/sdk/src/auto-collected.ts        | —            |
| 3   | Calling collecting() with fewer than 3 arguments        | MEDIUM   | packages/vite-auto-collect/src/analyse.ts | —            |

### annotate-third-parties (3 failure modes)

| #   | Mistake                                                                  | Priority | Source                                           | Cross-skill? |
| --- | ------------------------------------------------------------------------ | -------- | ------------------------------------------------ | ------------ |
| 1   | Using thirdParty() without autoCollect() plugin expecting runtime effect | HIGH     | maintainer interview                             | —            |
| 2   | Not spreading thirdParties sentinel into config                          | HIGH     | packages/sdk/src/auto-collected.ts               | —            |
| 3   | Not enabling usePackageJson when known packages are used                 | MEDIUM   | packages/vite-auto-collect/src/known-packages.ts | —            |

### render-policies (3 failure modes)

| #   | Mistake                                                                         | Priority | Source                         | Cross-skill?    |
| --- | ------------------------------------------------------------------------------- | -------- | ------------------------------ | --------------- |
| 1   | Rendering policy components outside OpenPolicy provider                         | HIGH     | packages/react/src/context.tsx | —               |
| 2   | Forgetting to import styles                                                     | MEDIUM   | packages/react/src/styles.ts   | —               |
| 3   | Generating static files with openPolicy() instead of rendering React components | CRITICAL | maintainer interview           | getting-started |

### cookie-banner (3 failure modes)

| #   | Mistake                                                            | Priority | Source                              | Cross-skill?    |
| --- | ------------------------------------------------------------------ | -------- | ----------------------------------- | --------------- |
| 1   | Not gating banner render on route === "cookie"                     | HIGH     | apps/www/registry/cookie-banner.tsx | —               |
| 2   | Building custom cookie consent state instead of using useCookies() | HIGH     | maintainer interview                | —               |
| 3   | Not using OpenPolicy provider before using useCookies()            | HIGH     | packages/react/src/context.tsx      | render-policies |

### migrate (2 failure modes)

| #   | Mistake                                                             | Priority | Source                     | Cross-skill? |
| --- | ------------------------------------------------------------------- | -------- | -------------------------- | ------------ |
| 1   | Rewriting policy content as free text instead of mapping to fields  | HIGH     | packages/core/src/types.ts | —            |
| 2   | Omitting optional terms sections that cover existing policy content | MEDIUM   | packages/core/src/types.ts | —            |

## Tensions

| Tension                                          | Skills                                            | Agent implication                                                                                                       |
| ------------------------------------------------ | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Minimal working setup vs legally complete config | getting-started ↔ define-config                   | Agent produces a working demo but legally incomplete document; should ask about jurisdiction before generating          |
| Auto-annotation vs explicit declaration          | annotate-data-collection ↔ annotate-third-parties | Agent may use one approach and miss the other, or enable usePackageJson and also add thirdParty() for the same services |
| Runtime rendering vs static generation           | render-policies ↔ vite-setup                      | Agent may use openPolicy() vite plugin and React rendering simultaneously, or use the wrong plugin entirely             |

## Cross-References

| From                     | To                     | Reason                                                                        |
| ------------------------ | ---------------------- | ----------------------------------------------------------------------------- |
| getting-started          | define-config          | Minimal config works; legal completeness requires the full field reference    |
| getting-started          | vite-setup             | Plugin setup is part of getting started; advanced options live in vite-setup  |
| annotate-data-collection | annotate-third-parties | Same plugin, same sentinel pattern; developers set up both together           |
| render-policies          | cookie-banner          | Both need OpenPolicy provider; cookie-banner uses CookiePolicy config context |
| define-config            | render-policies        | Cookie config fields drive which categories appear in policy and banner       |
| migrate                  | define-config          | Migration output is a defineConfig() call; needs full field reference         |

## Subsystems & Reference Candidates

| Skill                  | Subsystems | Reference candidates                                                                             |
| ---------------------- | ---------- | ------------------------------------------------------------------------------------------------ |
| define-config          | —          | PrivacyPolicyConfig fields (15+), TermsOfServiceConfig fields (18+ sections), CookiePolicyConfig |
| annotate-third-parties | —          | KNOWN_PACKAGES registry (~30 npm packages)                                                       |
| cookie-banner          | —          | HasExpression DSL (and/or/not combinators)                                                       |
| render-policies        | —          | PolicyComponents interface (8 override slots), PolicyTheme CSS custom properties (12 vars)       |

## Recommended Skill File Structure

- **Core skills:** define-config, annotate-data-collection, annotate-third-parties
- **Framework skills:** vite-setup, render-policies, cookie-banner
- **Lifecycle skills:** getting-started, migrate
- **Composition skills:** none required (shadcn/ui covered within render-policies and cookie-banner)
- **Reference files:** define-config may benefit from a reference section for the full PrivacyPolicyConfig and TermsOfServiceConfig field tables

## Composition Opportunities

| Library   | Integration points                                                                 | Composition skill needed?                                    |
| --------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| shadcn/ui | Pre-styled policy page components and cookie banner via `shadcn add @openpolicy/*` | No — covered within render-policies and cookie-banner skills |
| Vite      | autoCollect() plugin, virtual module resolution, dev server hot reload             | No — covered within vite-setup skill                         |
