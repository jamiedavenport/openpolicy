---
title: Overview
description: Generate policy files from your openpolicy.ts config
---

OpenPolicy can compile your policy config to Markdown, HTML, or PDF files. This is useful for serving policies as static files, checking them into your repo, or sending them to legal.

See the [Quick Start](/policies/quick-start) to render policies as React components instead.

## How it works

At build time (or on demand via the CLI), OpenPolicy reads your `openpolicy.ts` config and compiles each section into a document. Each present section produces its own output file:

| Section | Output filename |
|---|---|
| `privacy` | `privacy-policy.{ext}` |
| `cookie` | `cookie-policy.{ext}` |

## Output formats

| Format | Extension | Notes |
|---|---|---|
| `markdown` | `.md` | Default |
| `html` | `.html` | Standalone HTML document |
| `pdf` | `.pdf` | |

## Options

- **[Vite plugin](/generation/vite)** — generates files automatically at build time; watches for changes in dev
- **[Astro integration](/generation/astro)** — wraps the Vite plugin for Astro projects
- **[CLI](/generation/cli)** — generate on demand, useful outside of a Vite build
