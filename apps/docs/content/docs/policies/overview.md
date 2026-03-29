---
title: Overview
description: The three policy types supported by OpenPolicy
---

OpenPolicy supports three policy types, each defined as a section in your config and compiled independently.

| Policy | Config key | Output filename |
|---|---|---|
| Privacy Policy | `privacy` | `privacy-policy.{ext}` |
| Terms of Service | `terms` | `terms-of-service.{ext}` |
| Cookie Policy | `cookie` | `cookie-policy.{ext}` |

Each section is optional. Only the sections you define will produce output. All three share the `company` block for common details like name, address, and contact email.
