# TASK-IIIF-FE-WIRING — Work Log

## Prerequisite check

Blocked on first invocation: `.git/MERGE_HEAD` held
`7e5583d7127fb52c12538b545f49352fd160a5c3`, so the `feature-media-architecture`
merge was staged but uncommitted. Reported and stopped without editing.

Owner concluded and pushed the merge. Re-verified:

- branch `iiif`, HEAD `76932a245b48323b450ecb6743ad31dcac878317` (_chore: merge branch_)
- `.git/MERGE_HEAD`, `MERGE_MSG`, `MERGE_MODE` absent; no rebase/cherry-pick state
- 0 unmerged paths; 0 staged; 1 unstaged (`craco.config.js`, pre-existing); 27 untracked
- 0 ahead / 0 behind `origin/iiif`

## Ground truth recorded before editing

- `MediaRepository` had no concrete implementation anywhere in `src/`.
- `FragmentService` referenced neither `IiifRepository` nor `findManifest`.
- `resolveFragmentMedia` had no production caller (definition + its own test only).
- `/fragments/{number}/media` existed only as per-item URL builders in `mediaUrls.ts`
  plus tests; no runtime fetch.

## Implementation decisions

**Concrete repository placement.** `src/fragmentarium/infrastructure/MediaRepository.ts`
exporting `ApiMediaRepository`, matching `ImageRepository.ts` → `ApiImageRepository`
and `FindspotRepository.ts` → `ApiFindspotRepository`. Its basename matches the
guard's `/^media/i` discovery rule, so it is enumerated in
`mediaArchitectureModules` — i.e. it is part of the sealed media architecture,
not a production consumer of it.

**Isolation-guard exemption: exactly one entry.** Because the concrete repository
is itself a media architecture module, the only production runtime import of a
guarded module in the whole tree is the composition root constructing it. The
guard's single-module `mediaDomainConsumers` allowlist was generalised into a
`(consumer, modules)` pair list, preserving `mediaDomainModule`,
`mediaDomainConsumers` and `isMediaDomainConsumer` with identical semantics so
the pre-existing exemptions test passes unchanged. Mappers, URLs, DTOs, the port
interface and the media domain all remain forbidden to every production file,
including the composition root.

**Typed failure without a guarded import.** `MalformedMediaResponseError` lives in
`application/fragmentMediaErrors.ts` (basename does not match `/^media/i`), so
both the media-architecture repository and the unguarded application layer can
import it at runtime without widening the exemption surface.

**Beta gate placement.** `resolveMedia` short-circuits to
`resolveFragmentMedia({ hasPhoto })` when `betaAccess` is false, so non-beta
users issue zero new requests and the resolution is I/O-free. Both the Manifest
and the media-endpoint fetches sit behind the same gate, which keeps the
guaranteed-404 media route off production traffic during the staged rollout.

**Non-blocking resolution.** The resolution runs in `Images` via a hook rather
than a `withData` wrapper, so it never gates the photo Blob load. A never-settling
resolution still renders the photo (covered by test).

## Pre-existing issues found

None. `yarn lint` and `yarn tsc` were clean before and after; no pre-existing
failing test was observed in any focused suite that was run.

## Issues found in my own work and fixed at root

1. **Hook cancellation looked broken.** Investigated with a Bluebird harness:
   `Bluebird.resolve(p) === p` for Bluebird inputs, and cancellation propagates
   through `.then` children — but `onCancel` fires asynchronously. The hook was
   correct; two of my tests asserted synchronously. Fixed the tests, not the hook.
2. **`resolveMedia` called twice on rerender.** Caused by my test constructing a
   new service object per render; the effect's dependency on service identity is
   correct. Fixed the test to use a stable instance.
3. **Console noise in the reporting test.** Root cause: no `ErrorReporterContext`
   provider, so the default `ConsoleErrorReporter` ran. Fixed by supplying the
   error-reporter test double, not by silencing console.
4. **`testing-library/await-async-queries` false positive** on
   `repository.findByFragment(...)` — the plugin matches the `findBy*` name on a
   repository method. Two targeted `eslint-disable-next-line` directives in the
   test file only (repo has precedent); the method name is fixed by the merged
   `MediaRepository` contract.

## Constraint conflict noted

`.github/copilot-instructions.md` makes `yarn test --watchAll=false` a hard gate.
The task's constraints 16–17 forbid running the full suite. The task constraints
were followed; 80 focused suites / 983 tests were run instead. The full suite
remains outstanding before this work is proposed for merge.
