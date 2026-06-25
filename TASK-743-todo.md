# TASK-743 — Realia: stable-id links + structured AfO volume

## Scope

PR #743 (frontend) — verify implementation, then triage runtime `slugify` crash.
Depends on ebl-api PR #715 serving `realiaId`, `afoVolume`, `page`, resolved
per-entry `crossReferences`, and a `/realia/{realiaId}` lookup.

## TODO

- [x] Read `.github/copilot-instructions.md` and follow it.
- [x] Verify PR #743 already implemented across the 4 source files + fixtures/tests.
- [x] Reproduce/triage the `Cannot read properties of undefined (reading 'toLowerCase')`
      crash in `slugify` → `afoVolumeId` → `buildRealiaNav`.
- [x] Root-cause: local API serves the pre-PR-#715 shape (no `realiaId`/`afoVolume`/`page`).
- [x] Correct course: remove the backward-compat shims (violated "API Schema Alignment");
      restore schema-aligned code from committed state.
- [x] Run full gates: `yarn tsc`, `yarn lint`, full `yarn test --watchAll=false`.
- [x] Confirmed against real ebl-api PR #715 schema: it serves only the decorated `AfO`
      string (no `afoVolume`/`page`/`realiaId`/structured `crossReferences`). Repository now
      derives `afoVolume`/`year`/`page` from `AfO` (forward-compatible with future fields).
- [x] Fix broken AfO menu/subsections (derive volume/page so groups are non-empty).
- [x] Restore AfO volume year display in the header AND the on-this-page menu
      (shared `afoVolumeLabel`); anchors stay keyed on the clean `afoVolume`.
- [x] Fix AfO volume ordering: sort groups by descending numeric volume.
- [ ] User action: reload the app; cross-reference links / "See Also" still need the API
      to serve resolved `crossReferences {id, lemma}[]` (not in PR #715 yet).
- [ ] Remove TASK-743-\*.md before merge.
