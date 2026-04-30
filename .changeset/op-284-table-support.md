---
"@openpolicy/core": patch
"@openpolicy/renderers": patch
"@openpolicy/react": patch
"@openpolicy/vue": patch
---

Render structured policy data (data collected, retention, provision requirements, cookies, third parties) as tables instead of nested headings + bullet lists. Adds a new `table` block node to the document AST plus helpers (`table`, `row`, `cell`) and table cases in the markdown (GFM), HTML (`<table>`), PDF (PDFKit native `doc.table()`), React, and Vue renderers.

The React and Vue renderers expose six override slots (`Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`) so consumers can swap in shadcn-style table primitives independently. Defaults emit `data-op-table`, `data-op-table-header`, `data-op-table-body`, `data-op-table-row`, and `data-op-table-cell` attributes for descendant-selector styling.

Breaking: the `legal-basis` section is gone — its lawful-basis column merges into `data-collected` (now 4 columns under EU/UK, 3 elsewhere), and its Article 6 notice merges into the `data-collected` lead-in paragraph. The `data-collected`, `data-retention`, `provision-requirement`, `cookies`, `third-parties` (privacy) and `cookie-types`, `cookie-third-parties` (cookie) sections no longer emit `list`/sub-`heading` blocks; downstream consumers walking `DocumentSection.content` should add a `case "table":` branch.
