---
title: Overview
description: The policy types supported by OpenPolicy
---

OpenPolicy supports two policy types, compiled independently from a single flat config.

| Policy | Detected from | Output filename |
|---|---|---|
| Privacy Policy | `dataCollected`, `legalBasis`, `retention`, `children` | `privacy-policy.{ext}` |
| Cookie Policy | `cookies`, `consentMechanism`, `trackingTechnologies` | `cookie-policy.{ext}` |

Each policy is optional — OpenPolicy auto-detects which to produce based on the fields you provide. The `company` block and shared fields (`effectiveDate`, `jurisdictions`) live at the top level and apply to every policy generated.
