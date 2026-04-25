---
"@openpolicy/sdk": patch
"@openpolicy/core": patch
---

Name the EDPB members directory in the GDPR supplement complaint paragraph instead of referring generically to "your local data protection authority", and add an optional `company.euRepresentative` field for non-EEA controllers required to designate an Article 27 GDPR representative.

Resolves the `supervisory-authority-complaint-eu` validator warning. The EDPB-directory link is rendered unconditionally for `eu` jurisdictions; the Article 27 paragraph is rendered only when `company.euRepresentative` is set.
