# Media gallery work log

## 2026-10-23

- Read `.github/copilot-instructions.md` in full before editing implementation.
- Working on `media/frontend-gallery` from current master; root owns commits and PR publication.
- Production migration and deployment are excluded from this implementation task.
- Existing media types, mappers, interfaces and image controls will be reused.

- Agreed canonical query-scoped API paths with the backend agent, including
  slash-containing museum numbers; extended URL validation only for these paths.
- Implemented authenticated repository and bounded binary loader, optional
  gallery provider and feature flag, fragment media-summary mapping, gallery
  pagination/selection, original downloads, raster-only previews and fallback.
- Added authenticated primary thumbnails for search and latest cards, reusing
  their legacy rendering and preserving lazy viewport loading.
- Reused existing zoom/download controls through a shared raster viewer.
- Independent review identified that an early App-wide authentication key could
  remount editors when identity is unavailable. Removed that key and scoped
  session resets only to media data; added provider and gallery regression tests.
- EXIF extraction now validates missing tags and ignores stale callbacks, and
  supports selected original-only gallery items without additional downloads.
- Added frontend build wiring and rollout documentation; no production actions.
- Independent review also found Python/JavaScript URL-encoding differences for
  `!`, apostrophes, parentheses and `*`. Canonical frontend encoding now matches
  backend query URLs exactly, including authenticated summary-thumbnail matching.
- Moved rollout guidance into the existing README following the foundation PR's
  reviewer guidance against additional permanent documentation files.

- Independent cross-stack checks loaded actual Falcon DTOs through the frontend
  repository and binary loader for five punctuation/Unicode museum numbers;
  original-only nonprimary records and attribution remain intact.
- Added `legacyHasPhoto` compatibility mapping and an explicit lazy Legacy photo
  choice so COPY-only partial migrations preserve existing photo access.
- First focused run passed 119 tests; four fixture failures traced to Jest resetMocks
  resetting module-level callbacks and a decorative image role query. Fixed test
  initialization and queried the image by alternative text; no console suppression.
- Initial full TypeScript and lint checks passed; final full CI coverage suite is
  now running after native canvas was built using the locked dependency versions.
- Applied the React review checklist: stable service memoization, session-scoped
  media state, cancellable effects, bounded preview requests, native buttons and
  no new UI framework or dependencies.

- The first full CI run was killed by the OS under concurrent backend/frontend
  memory pressure. Subsequent heavy gates are being serialized on this 8 GiB host.
- That run found a pre-existing newsletter date bug: UTC date-only inputs were
  formatted in the host timezone, showing the previous month west of UTC. Set the
  timeline's date formatter to UTC, preserving the publication calendar date.
- Removed unrelated CDLI images from the disabled-gallery regression fixture so
  its no-media assertions do not leave an unrelated asynchronous CDLI load pending.

- Confirmed the newsletter defect by rendering the unchanged baseline component
  from commit e5fdd562 in isolation: inherited TZ=America/New_York changes a
  2025-03-01 UTC publication date into "Feb 2025". The one-line UTC format fix
  passed the existing test in isolation and remains a deliberately small repair.
- Root's Chromium harness imported the actual frontend provider/components/API
  client against the actual backend and local MongoDB/GridFS. Verified encoded
  museum numbers, selection, 12-image pagination, byte-exact original downloads,
  metadata/museum credits, original-only records, empty and partial migration,
  denied access and clean browser console. Screenshot and logs are in the shared
  verification directory; no production connection was used.
- Narrow typed response errors now preserve unsupported-response diagnostics and
  an explicit lazy legacy action after successful authorized responses. Permission
  and server errors still cannot enter the fallback path. Independent review
  approved this distinction and regression tests cover it.
- Latest focused checks: 6 suites, 58 tests passed with no console output. Earlier
  focused coverage run: 16 suites, 144 tests passed; unrelated configured global
  coverage thresholds predictably require the full suite. Covered new media modules
  had 100% line coverage; remaining branches and card integration now have tests.

- Independent final review ran 12 focused suites and 86 tests with no console
  warnings/errors; no unresolved code findings remain. The actual Falcon DTO
  contract probe also passed again after the final production source changes.
- Final whitespace and line-ceiling checks passed: all 47 touched TS/TSX files
  are at or below 250 lines. Production code is frozen pending full gates.

- Scoped coverage verification reached 100% statements, branches, functions and
  lines for all executable new media/gallery/card modules. The same run exposed
  existing latest-card tests that assume UTC while the host inherited
  America/New_York. Their production behavior intentionally formats timestamps
  locally, so it was preserved. Final verification explicitly exports TZ=UTC to
  match CI and the requested environment; no test configuration was weakened.
- The exact full `yarn test:ci` command is now running in an exclusive memory slot
  with UTC verification environment and frozen production source.

- The first complete full run passed 685 suites/5,884 tests, all 47 snapshots and
  configured coverage thresholds; only two pre-existing media-contract assertions
  still expected the old route shape. Updated those exact expectations to the
  canonical query-scoped backend routes. No tests were disabled or removed.
- Removed redundant unreachable null branches in summary thumbnail URL selection
  and added default binary-link/URL-cleanup coverage. Added legacy acquisition
  omission and empty-import guard fixtures; affected coverage gaps are closed.
- Final authentication audit found that stale `getUser` metadata could keep the
  old gallery scope after logout. Scope now includes authenticated state explicitly.
  Actual InjectedApp tests cover known, missing and throwing user metadata, stable
  rerenders, logout scope changes and preserved unrelated editing state. Four
  focused suites/55 tests pass without console output.
- Final type/lint/production-build checks restarted after this required auth fix;
  the exact full CI rerun follows with UTC verification environment.

- Frozen-source whole-project gates passed: TypeScript 15.58 seconds, lint 34.37
  seconds, and production `yarn build:ci-stable` 30.32 seconds with "Compiled
  successfully". Independent auth review passed all 25 focused tests, console-clean.
- Final exact `yarn test:ci` rerun started under TZ=UTC after these gates.

- FINAL FULL GATE PASSED: exact `yarn test:ci`, with TZ=UTC, completed in
  537.138 seconds: 686/686 suites, 5,892/5,892 tests and 47/47 snapshots passed.
  No console warnings/errors or configured coverage-threshold failures occurred.
- Full-project coverage: 98.63% statements, 96.44% branches, 98.65% functions and
  98.69% lines. A programmatic audit of every changed non-test TS/TSX module found
  100% statements, branches, functions and lines in all 29 instrumented changed
  modules, including all 14 new executable modules. MediaRepository.ts contains
  the interface and empty Error subclass and has no Istanbul-instrumented code.
- Final whitespace and source-line-ceiling checks are clean. Implementation,
  independent review, runtime verification and all repository gates are complete.
  Root owns commit/push/PR publication and subsequent GitHub feedback review.
- No production database, migration, index provisioning or deployment was touched.
  All frontend writes are paused after this final handoff for publication.
