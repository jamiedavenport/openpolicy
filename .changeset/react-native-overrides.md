---
"@openpolicy/react": patch
---

Make `PrivacyPolicy` and `CookiePolicy` overridable end-to-end so they work on React Native (Expo).

- Add `Root` and `ListItem` slots to `PolicyComponents`. Without `Root`, Metro previously crashed with `View config getter callback for component "div" must be a function` because the wrapper element was hardcoded.
- Route every node through the `components` map. `paragraph`, `list`, and `listItem` no longer fall through to hardcoded `<p>`, `<ol>/<ul>`, `<li>` tags when an override is missing — they render `DefaultParagraph` / `DefaultList` / `DefaultListItem` instead.
- Export `DefaultRoot` and `DefaultListItem` for partial overrides.
- Loosen the `style` prop on `PrivacyPolicy` / `CookiePolicy` from `CSSProperties` to `unknown` so RN `ViewStyle` objects type-check. **Breaking** for the rare consumer who destructured `CSSProperties` straight off the prop type.
