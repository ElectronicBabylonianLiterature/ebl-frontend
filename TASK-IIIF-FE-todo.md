# TASK-IIIF-FE — TODO

Scope: investigation + planning only. Deliverable: `docs/IIIF_FRONTEND_ARCHITECTURE_HANDOFF.md`.
No production code changes. No commits/pushes/installs/deploys. No full test suite.

- [x] 1. Confirm repo path, branch `feature-media-architecture`, HEAD, base, upstream, working tree
- [x] 2. Read repository instructions (`CLAUDE.md`, `AGENTS.md`, `.github/copilot-instructions.md`, `.github/instructions/**`)
- [x] 3. Enumerate branch-unique commits and full diff vs merge-base
- [x] 4. Read all new media-architecture modules (domain, DTO, mappers, ports, urls)
- [x] 5. Prove runtime usage vs scaffolding (importer graph + executed isolation test)
- [x] 6. Reconstruct pre-existing media/image runtime architecture
- [x] 7. Trace one image end-to-end (route -> DTO -> service -> cache -> component -> binary)
- [x] 8. Trace legacy / non-image media paths (folio, CDLI, base64 signs, static ApiImage)
- [x] 9. Inventory user surfaces displaying media
- [x] 10. Inspect package manifest + lockfile for viewer compatibility constraints
- [x] 11. Verify IIIF specs + candidate viewer libraries against primary sources
- [x] 12. Security review: sanitization, CSP, CORS, external URLs, downloads, tabnabbing
- [x] 13. Accessibility + localization conventions
- [x] 14. Caching / performance conventions
- [x] 15. Test + fixture conventions
- [x] 16. Write handoff document (33 sections, evidence labels, 2 Mermaid diagrams)
- [x] 17. Final report

## Reminder before PR merge

Per `.github/copilot-instructions.md`, remove `TASK-IIIF-FE-todo.md` and `TASK-IIIF-FE-log.md`
before this work is merged.
