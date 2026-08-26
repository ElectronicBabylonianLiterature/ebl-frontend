# TASK-IIIF-MEDIA-MERGE — Work Log

## Ground truth

- Repository: `/workspaces/ebl-frontend` (package name `ebl-frontend`)
- Branch: `iiif` (upstream `origin/iiif`)
- `iiif` HEAD: `cccacb0e85443b098ffa218e203edacf71c12610`
- `feature-media-architecture`: `7e5583d7127fb52c12538b545f49352fd160a5c3`
- Merge-base: `cccacb0e85443b098ffa218e203edacf71c12610` (equals HEAD)
- Ahead/behind (`iiif...feature-media-architecture`): 0 ahead / 16 behind
- No merge/rebase/cherry-pick in progress at start
- 60 porcelain status entries (48 tracked add/modify, 12 untracked paths)

## Collision analysis

- Untracked x feature-branch tree: none
- Staged x feature-branch changed: `src/fragmentarium/domain/media.ts`
- Worktree-modified x feature-branch changed: none
- `docs/` is untracked locally and not tracked on `feature-media-architecture`
  (media docs were added at `f4055e51`/`501c817a` and removed at `3944b686`),
  so no docs collision.

## Merge

`git merge --no-commit --no-ff feature-media-architecture`

First attempt failed: the ort strategy refuses to merge while the index differs
from `HEAD`. Remediation, all path-specific and non-destructive:

1. `git rm --cached src/fragmentarium/domain/media.ts` + removed the working-tree
   copy (proven byte-identical to `feature-media-architecture:` version,
   sha256 `024378af…b05c`), so Git could write the tracked branch version.
2. Recorded the 48 staged paths, then `git restore --staged` on exactly those
   paths (index only; working tree untouched).
3. Re-ran the merge: "Automatic merge went well; stopped before committing as
   requested". Zero conflicts, zero unmerged paths.
4. Re-staged the 47 non-`media.ts` paths.

Post-merge snapshot verification: all 74 backed-up files present and byte-identical.

## Reconciliation

### media.ts

Byte-identical on both sides; kept the tracked feature-branch version. No edit.

### Isolation guard

Two real failures after the merge:

1. `findExpectedMediaArchitectureModules` discovered `fragmentarium/domain/mediaSource`
   and `fragmentarium/domain/mediaImageService` (they match the `/^media/i`
   naming convention but belong to the IIIF architecture, not the media one).
2. The real-source-tree scan flagged runtime imports of `fragmentarium/domain/media`
   from `fragmentarium/domain/iiifMedia.ts` and
   `fragmentarium/infrastructure/iiif/iiifCanvasBody.ts`.

Resolutions:

- `iiifMedia.ts` imports only types from `fragmentarium/domain/media`; converted
  to `import type`. TypeScript erases it, so there is no runtime import and the
  guard's pre-existing type-only exemption applies. No guard change needed.
- `iiifCanvasBody.ts` needs the runtime value `isRasterMediaMimeType`. Added an
  explicit, enumerated `mediaDomainConsumers` allowlist that exempts _only_ that
  file and _only_ `fragmentarium/domain/media` — every other guarded module stays
  forbidden for it.
- Added an explicit, enumerated `iiifArchitectureModules` list that
  `isMediaArchitectureFile` excludes, so disk discovery matches the inventory
  again while still failing for any new unexempted media-named module.

Non-vacuity coverage added in
`src/test-support/mediaArchitectureIsolationGuard.exemptions.test.ts`, plus a
manual end-to-end mutation: appending
`export { isRasterMediaMimeType } from 'fragmentarium/domain/media'` to
`Photo.tsx` still fails the real-source-tree scan (file restored byte-identically).

### Source precedence

`resolveFragmentMedia` could not previously reach `media-endpoint`. Added a
`MediaEndpointResult` union and a `mediaEndpoint` input so the resolver can
represent all four kinds, and `mediaEndpointReason` diagnostics on the fallback.
Not wired into runtime; the remaining call site is documented in the handoff.

## Results

- Focused tests: 66 suites / 842 tests, all pass, zero console output.
  - media + IIIF batch: 29 suites / 508 tests
  - viewer + fragment batch: 37 suites / 334 tests
  - guard + precedence re-run: 5 suites / 91 tests
- `yarn lint`: exit 0, no errors or warnings.
- `yarn tsc --noEmit`: exit 0.
- Full test suite deliberately NOT run (task constraint). `yarn test --watchAll=false`
  should be run before this work is proposed for merge.
- Merge left uncommitted on `iiif`; `HEAD` unchanged at `cccacb0e`,
  `.git/MERGE_HEAD` at `7e5583d7`. Nothing pushed, nothing deployed.
- Handoff: `docs/IIIF_FRONTEND_MEDIA_MERGE_HANDOFF.md`.

## Reminder before PR merge

Remove `TASK-IIIF-MEDIA-MERGE-todo.md`, `TASK-IIIF-MEDIA-MERGE-log.md`, and the
other root-level `TASK-*.md` / `PR_*_REVIEW*.md` files.
