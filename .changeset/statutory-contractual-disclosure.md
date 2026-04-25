---
"@openpolicy/core": patch
"@openpolicy/sdk": patch
---

Add a new `data.provisionRequirement` map and a `provision-requirement` section that satisfies the GDPR Article 13(2)(e) disclosure: for each collected category, the controller must state whether providing the data is statutory, contractual, a contract-prerequisite, or voluntary, and the consequences of failing to provide it.

Resolves the `statutory-contractual-obligation` validator error.

**Breaking config change.** `DataConfig.provisionRequirement` is now required: every key in `data.collected` must have a matching `{ basis, consequences }` entry. `defineConfig`'s generic enforces exhaustiveness alongside the existing `purposes` / `lawfulBasis` / `retention` maps. Existing configs need to add the new map — for example:

```ts
data: {
  collected: { "Account Information": ["Email"] },
  purposes: { "Account Information": "To authenticate users" },
  lawfulBasis: { "Account Information": "contract" },
  retention: { "Account Information": "Until account deletion" },
  provisionRequirement: {
    "Account Information": {
      basis: "contract-prerequisite",
      consequences: "We cannot create or operate your account.",
    },
  },
},
```

Under EU/UK jurisdictions the renderer emits a new `provision-requirement` section after `data-retention` listing each category with its basis label and consequences.
