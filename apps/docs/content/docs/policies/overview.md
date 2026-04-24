---
title: Overview
description: The policy types supported by OpenPolicy
---

OpenPolicy supports two policy types, rendered independently from a single flat config.

| Policy         | Detected from                                          |
| -------------- | ------------------------------------------------------ |
| Privacy Policy | `data`, `legalBasis`, `retention`, `children`          |
| Cookie Policy  | `cookies`, `consentMechanism`, `trackingTechnologies`  |

Each policy is optional — OpenPolicy auto-detects which to produce based on the fields you provide. The `company` block and shared fields (`effectiveDate`, `jurisdictions`) live at the top level and apply to every policy rendered.
