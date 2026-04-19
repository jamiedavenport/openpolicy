---
title: Overview
description: The policy types supported by OpenPolicy
---

OpenPolicy supports two policy types, each defined as a section in your config and compiled independently.

| Policy | Config key | Output filename |
|---|---|---|
| Privacy Policy | `privacy` | `privacy-policy.{ext}` |
| Cookie Policy | `cookie` | `cookie-policy.{ext}` |

Each section is optional. Only the sections you define will produce output. Both share the `company` block for common details like name, address, and contact email.
