# Independent media gallery review

## Summary

No blocking correctness finding remains in the reviewed gallery code. The
repository-wide final suites and quality gates remain author-owned requirements;
their completion is not implied by this focused independent review. Final commit
identity and new PR feedback review are pending. No production rollout occurred.

Reviewed base commit: `e5fdd56287bbbd06d39397b3baab9b11918af9f8`.
Final reviewed changed-file digest, including all auth and thumbnail corrections:
`bcdc8eb8d722d9055ee9748d0df1c7a9a5679c0e2b16efee1347e3242c52c580`.
This covers 56 changed/untracked non-TASK paths. Per-file snapshots and prior
verification logs are retained outside the implementation tree.

## Findings

- Fixed: backend query URLs were initially rejected by the mapper. The narrow
  media-query contract now accepts them, and binary fetching reconstructs routes
  from current fragment identity rather than trusting response URLs.
- Fixed: Python and JavaScript encoding differed for `!'()*`. The canonical
  encoder now matches actual backend DTO URLs.
- Fixed: application-wide auth keys could reset unrelated application state.
  Session changes now invalidate only gallery state and requests.
- Fixed: nonempty COPY-only media hid a still-unmigrated legacy photograph.
  Explicit `legacyHasPhoto` preserves a lazy Legacy photo choice.
- Fixed: backend-enriched new-only photos could request nonexistent legacy
  originals when the frontend flag was disabled. Disabled gallery availability
  now respects explicit legacy availability.
- SVG is offered as an explicit download without inline rendering or opening.
  Unsafe raster preview responses are rejected. Private gallery state clears on
  session changes, pending requests cancel, and object URLs are revoked.
- Fixed: unsupported successful listing responses now retain explicit
  diagnostics and a lazy legacy choice through a narrow application error.
  Authorization errors still propagate without legacy fallback.
- Fixed: the earlier React act warning was resolved through test synchronization.
  The final independent focused run was console-clean.

## Severity

No unresolved production-code blocker found in the reviewed scenarios.
Repository gates passed; publication feedback review remains required.

## Reproduction Steps

The independent reviewer ran twelve focused UI/adapter suites: **86 tests passed
in 7.693 seconds**, with no console warnings or errors.
This covered authorization failures without legacy fallback, original-only
media, partial migration, disabled-gallery rollback, SVG download safety,
preview retry, session clearing, request cancellation, and URL cleanup.

Subsequent affected-file checks also passed: 19 route/no-media tests, 105
thumbnail/domain/architecture tests, and 25 auth/provider/gallery tests. Every
run was console-clean, and source digests were stable before and after. The auth
checks include known, missing, and throwing user metadata; stable rerendering;
logout invalidation despite stale metadata; and preservation of editor state.

A separate cross-stack probe exported five actual Falcon/DTO responses and
consumed them through the current frontend repository and binary loader. The
scoped URLs matched exactly for punctuation, Unicode, slash, and percent cases.
Original-only nonprimary media and attribution were preserved.

## Recommendation

Keep the gallery flag off until backend and migration verification are ready.
The frontend lint/type/test/coverage/build gates are complete.

## What Has To Be Done

1. Record final committed SHA and reconcile changes after the reviewed digest.
2. Fetch all new PR comments, review submissions, and inline threads after first
   publication and address actionable feedback before final handoff.
3. Remove temporary TASK documents according to repository policy before merge.

Merged foundation PR #765 feedback was fully fetched: 12 timeline entries,
8 reviews, and 3 resolved outdated threads. URL safety, unknown-type handling,
and runtime integration boundaries were specifically reviewed. New PR feedback
remains pending first publication.

Root separately reported a real-browser integration pass against actual API,
MongoDB/GridFS, frontend provider/adapters, ApiClient, and gallery components.
Ten checks covered pagination, lazy original access, downloaded-byte SHA-256,
slash-containing museum numbers, credits, original-only media, partial legacy
selection, and 403 without fallback. Runtime JavaScript errors were zero; the
only browser console entry was the expected denied network request. Evidence is
in the external verification log and screenshot. This is additional root-run
evidence, distinct from the independent reviewer's focused tests.

Root also ran the composed migration-to-browser workflow: a new versioned
synthetic plan, explicit index preparation, apply, idempotent resume, owned
gallery preview, EXIF Artist/Copyright attribution, and byte-exact original
download all passed. The prior ten gallery checks passed in the same composition.
This separate root-run test completed in 6.41 seconds; its log and composition
manifest are retained outside the implementation trees. No production operation
was involved.

Final gate evidence supplied by the implementation agent: exact `yarn test:ci`
with TZ=UTC passed all **686 suites, 5,892 tests and 47 snapshots** in 537.138
seconds, without console warnings/errors. Whole-project TypeScript, lint and
production build passed on the same source. Coverage is 98.63% statements, 96.44%
branches, 98.65% functions and 98.69% lines globally; every one of the 29 changed
source modules with instrumented executable code, including 14 new modules, has
100% on all four metrics. The interface/empty Error subclass module has no
Istanbul-instrumented statements. This gate evidence is distinct from the
independent focused checks documented above.
