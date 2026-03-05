Review the current git changes and update project documentation to reflect them.

## Steps

1. Run `git diff HEAD` and `git status` to understand what has changed.

2. Read the changed source files to understand the nature of the changes.

3. Read `README.md` and `CLAUDE.md`.

4. Update documentation as needed:

   - **README.md**: Update if public-facing behaviour changed — new packages, new policy fields, changed configuration options, new output formats, new CLI commands, or new quick-start steps.
   - **CLAUDE.md**: Update if project structure, domain concepts, conventions, or dev tooling changed — new packages, renamed packages, new git hooks, changed build commands, or architectural decisions.

5. Only edit sections that are actually affected. Do not rewrite unaffected sections.

6. After editing, briefly summarise what you changed and why.
