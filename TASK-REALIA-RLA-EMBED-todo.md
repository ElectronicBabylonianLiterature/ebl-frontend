# TASK-REALIA-RLA-EMBED — Research & plan: embed RlA page display in subsections

## Scope

PR #743 follow-up (research + plan only, no code). Investigate embedding the
badw RlA scanned-page display (e.g. publikationen.badw.de/de/rla/index#6603)
directly under each RlA subsection. Handle multi-page articles. Nice-to-have:
locate/show the article's beginning on the page image.

## TODO

- [x] Read `.github/copilot-instructions.md` and follow it.
- [x] Inspect our RlA data model (ReallexikonEntry.id / title / reference).
- [x] Reverse-engineer the badw viewer (tech, data source, image URL pattern).
- [x] Confirm cross-origin embedding is possible (CORS / X-Frame-Options).
- [x] Confirm the id -> image mapping and multi-page range computation.
- [x] Evaluate options (image embed / PDF / IIIF / iframe).
- [x] Assess the "article beginning on image" nice-to-have.
- [x] Write the plan (see log) and present it.
- [ ] Await user decision on scope (MVP frontend-only vs backend-ingest) before
      any implementation.
- [ ] Remove `TASK-REALIA-RLA-EMBED-*.md` before merge.
