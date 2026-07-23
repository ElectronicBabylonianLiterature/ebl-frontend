# TASK-ts7-migration — Review (PR #773)

**PR:** #773 `chore/ts7-tsconfig-migration` → `master`
**Title:** chore: migrate TypeScript config off TS7-deprecated compiler options
**Reviewed head:** `origin/chore/ts7-tsconfig-migration` (4f71cb24)
**Base:** `origin/master` (4db5c9cd)

## Summary

Migrates `tsconfig.json` off TS7-deprecated options (`target: es5→es2020`,
`moduleResolution: node→bundler`, `baseUrl` removed in favour of `paths`, drops
`downlevelIteration`/`ignoreDeprecations`) and adds `craco.config.js` to compensate for the
`baseUrl` removal in webpack + jest and to quiet build warnings. The bulk of the diff is a
mechanical `import Promise from 'bluebird'` → `import Bluebird from 'bluebird'` rename across
~16 test files plus a few source files, forced by the `target` bump (TS1064). All test
changes are pure renames with **no assertions weakened or removed** (verified line-by-line
and by numstat balance). Resolution was verified empirically in all three contexts (tsc via
`paths`, webpack via `resolve.modules`, jest via `modulePaths`); the app compiles and serves;
the full suite passes console-clean; and — after correcting an environment error (see the
Correction box) — **`yarn tsc` is clean on this branch**. The one remaining substantive item
is the Sass deprecation suppression; the rest is pre-merge doc cleanup.

> ### ⚠️ Correction (supersedes the earlier draft of this review)
>
> An earlier draft of this review reported a **Blocker**: that `yarn tsc` failed on #773 and
> `master` with 2 errors in `SignImages.tsx:297,306`, and a **High** process finding that CI
> did not gate on tsc. **Both were false positives and are retracted.**
>
> - **Root cause of the error:** the tsc runs were done in git worktrees that symlinked the
>   _current_ `chore/remove-bluebird` `node_modules`, from which #774 had removed
>   `@types/bluebird`. Without those type defs, `Bluebird<CroppedAnnotation[]>` resolved to
>   `unknown`, manufacturing the `result.value is of type 'unknown'` errors. A fresh
>   `yarn install --frozen-lockfile` in an isolated worktree of #773 → **`tsc` exits 0**.
> - **CI already gates on tsc:** `.github/workflows/main.yml` has a `Compile` step running
>   `yarn tsc`. No CI change is needed.
> - **Net effect:** #773 meets the type-check gate; there is no merge-ordering problem and no
>   CI gap. (A subagent "confirmed" the original finding but used the same polluted worktree.)

## Findings

### Finding 1 — craco suppresses Sass deprecations that originate from the app's own SCSS

- **Severity:** Medium
- **File:** `craco.config.js:60-99` (`sassOptions.silenceDeprecations`, `quietDeps`, and
  `ignoreWarnings` for `@import`, `darken()`, legacy JS API, global built-ins).
- **Description:** The config globally silences Sass deprecation warnings. These are not
  purely third-party: the app's own SCSS triggers them — 41 `.scss`/`.sass` files use
  `@import`, and `src/fragmentarium/ui/text-annotation/TextAnnotation.sass` uses `darken()`.
  Silencing app-owned deprecations conflicts with the project's "fix warnings at root cause,
  do not suppress" principle.
- **Failure scenario:** Dart Sass 2.0 removes `@import` and legacy color functions; the app's
  SCSS then breaks with no prior warning because the deprecations were silenced.
- **Recommendation:** Migrate the app's own SCSS `@import`→`@use`/`@forward` and
  `darken()`→`color.adjust()`/`color.scale()`, and scope the craco suppression to
  `node_modules` only. **(Chosen resolution: migrate now — in progress on #774.)**

### Finding 2 — Three internal task-tracking docs would ship to `master`

- **Severity:** Medium
- **Files:** `TASK-ts7-migration-log.md`, `TASK-ts7-migration-research.md`,
  `TASK-ts7-migration-todo.md` (repo root, newly added).
- **Description:** Three ephemeral process docs are included in the diff. They document a
  one-time migration and are not the "commit docs with code" kind that should persist.
- **Recommendation:** Delete all three before merge (plus this `TASK-ts7-migration-review.md`).

## Severity

| #     | Finding                                                                        | Severity    | Blocker?               |
| ----- | ------------------------------------------------------------------------------ | ----------- | ---------------------- |
| 1     | craco silences app-owned Sass deprecations                                     | Medium      | No                     |
| 2     | 3 committed `TASK-ts7-migration-*.md` process docs                             | Medium      | No (pre-merge cleanup) |
| ~~—~~ | ~~`yarn tsc` fails~~ — **RETRACTED** (env artifact; tsc is clean)              | ~~Blocker~~ | No                     |
| ~~—~~ | ~~CI does not gate on tsc~~ — **RETRACTED** (main.yml already runs `yarn tsc`) | ~~High~~    | No                     |

No correctness, runtime-regression, security, or console-noise defects were found in the
migration content.

## Reproduction Steps

- **tsc (corrected):** `git worktree add --detach /tmp/wt773 origin/chore/ts7-tsconfig-migration`;
  in it run `yarn install --frozen-lockfile` (its **own** node_modules, not a symlink) then
  `./node_modules/.bin/tsc` → **exit 0**.
- **Finding 1:** inspect `craco.config.js`; `grep -rl "@import" src --include=*.scss --include=*.sass | wc -l` → 41; `darken(` appears in `TextAnnotation.sass`.
- **Finding 2:** the repo-root `TASK-ts7-migration-*.md` files.
- **Migration health:** `yarn lint` clean; `yarn test --watchAll=false` = 340 suites
  console-clean; `yarn build` succeeds; dev server "Compiled successfully!", HTTP 200.

## Recommendation

**Approve, pending pre-merge cleanup.** The tsconfig migration is well-executed, low-risk,
and meets all gates (the earlier tsc "blocker" was an environment artifact, now corrected).
Resolve the Sass suppression at root cause (Finding 1) and remove the process docs (Finding 2)
before merge.

## Comment Status Tracking

| Source | Location | Status                                                              | Outdated |
| ------ | -------- | ------------------------------------------------------------------- | -------- |
| —      | —        | No GitHub reviews, inline comments, or issue comments exist on #773 | —        |

## What Has To Be Done

1. **Sass (Finding 1):** migrate app SCSS `@import`→`@use`/`@forward` and
   `darken()`→`color.adjust()`; scope craco's Sass suppression to `node_modules`.
2. **Remove process docs before merge:** `TASK-ts7-migration-log.md`,
   `TASK-ts7-migration-research.md`, `TASK-ts7-migration-todo.md`, and this review file.
3. **Re-run all gates** after item 1: `yarn tsc`, `yarn lint`, `yarn test --watchAll=false`
   (console-clean), `yarn build`.
4. ~~Make tsc green / add CI gate~~ — **not required** (tsc is clean; CI already runs it).
