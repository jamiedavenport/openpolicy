# Real-world fixture snippets

These files are **hand-authored fixtures** that model patterns observed in
public open-source projects (Cal.com, Documenso). They are not direct copies
of code from those projects.

The intent is to prove the scanner correctly identifies cookie writes and
vendor scripts in idiomatic production code shapes, while keeping the test
corpus small, deterministic, and free of any third-party licensing
considerations.

For full-app coverage against the upstream projects themselves, see the
tarball-driven test suite under `tests/real-world/` (gated on
`OPENCOOKIES_REAL_WORLD=1`).
