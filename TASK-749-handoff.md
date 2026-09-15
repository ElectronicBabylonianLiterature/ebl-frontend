<!-- markdownlint-disable MD013 -->

# TASK-749 — Handoff

**Branch:** `add-name-breaks`
**Based on:** `chore/remove-bluebird` (PR #774) — a deliberate deviation from the brief, which specifies `master`
**Source material:** `TASK-749-frontend-brief.md`, `TASK-749-frontend.patch` (commit `a9df351`), `TASK-749-frontend-pr-body.md`
**Blocks:** `ebl-api` [PR #743](https://github.com/ElectronicBabylonianLiterature/ebl-api/pull/743)

## What this change does, in plain words

The backend used to send a sign's name as **one list**, with the brackets mixed in
among the letters. It now sends **two lists**: the letters in `nameParts`, and the
brackets that fall inside the name in a new list, `nameBreaks`.

If the website keeps reading only the first list, it draws `kur` where the tablet
actually reads `k[ur`. The `[` is not decoration — it marks where the clay is broken
off. Dropping it claims we can read something that is actually damaged. It is a
**wrong reading of the source**, and it fails **silently**: nothing crashes, nothing
logs, the text is just quietly wrong.

The fix is a small helper, `nameTokens()`, that zips the two lists back together.
If `nameBreaks` is missing or `null` — which is what today's backend sends — it hands
back `nameParts` untouched. That is what lets this ship on its own: against the current
backend it behaves exactly as before.

Both places that walk a name now go through the helper: `extractEnclosureTypes` in
`token.ts` and `addAccents` in `accents.ts`, which is what `DisplayToken` calls to build
what you actually see on screen.

## State

Implemented, all gates green, committed as `d506a0de`, pushed, and opened as
**[PR #817](https://github.com/ElectronicBabylonianLiterature/ebl-frontend/pull/817)**
against `chore/remove-bluebird`. See `TASK-749-log.md` for the full gate table and
`TASK-749-todo.md` for the checklist.

| Gate                                 | Result                                                 |
| ------------------------------------ | ------------------------------------------------------ |
| `yarn tsc`                           | 0 errors                                               |
| `yarn lint`                          | clean                                                  |
| `CI=true yarn test --watchAll=false` | 500 suites / 4402 tests passing                        |
| Console noise                        | zero                                                   |
| Coverage                             | exit 0, thresholds met; `token.ts` 100% incl. branches |
| 250-line ceiling                     | max 245 (`token.ts`)                                   |

## Findings that remain to address

1. **Deploy order vs. the stacked base — the one to actually think about.**
   The brief is emphatic that this frontend change must be live _before_ ebl-api #743,
   because the moment #743 deploys, every un-updated client starts silently dropping
   brackets. Basing this PR on `chore/remove-bluebird` couples its release to #774
   merging first. If #774 has any runway left, consider cutting this from `master`
   instead so the two can move independently. Cherry-picking the single commit onto a
   fresh branch off `master` is enough — the change does not depend on anything in #774.

2. **PR base needs retargeting.** The PR targets `chore/remove-bluebird`. Once #774
   merges, retarget it to `master`, or it cannot merge.

3. **Browserslist advisory — pre-existing.** Every test run prints
   `Browserslist: browsers data (caniuse-lite) is 8 months old`. It is a craco banner
   printed before any test runs, not `console.error`/`console.warn` from a test, and it
   is unrelated to this change. Clearing it means `npx update-browserslist-db@latest`,
   which rewrites `yarn.lock` — a dependency bump deliberately kept out of a focused
   stacked PR. **Decide whether to fix it separately.**

4. **`accents.ts` branch coverage 85%** (lines 57-61, 132) — pre-existing. The `?? letter`
   fallbacks in `addGraveAccent`/`addAcuteAccent` and the `|| c` fallback in `addBreves`.
   Untouched by this patch, in functions this change never calls. `accents.ts` is not in
   craco's `fullyCoveredPaths`, so no per-file 100% threshold applies, and the full
   coverage run exits 0. The **affected** code is fully covered.

5. **Task docs must be deleted before merge.** Per the project's cleanup rule:
   `TASK-749-*` (6 files, including the three source-material files and this handoff),
   `TASK-774-*` (5), `TASK-ts7-*` (3).

6. **`src/test-support/` fixtures were intentionally left alone.** They carry
   legacy-shaped payloads with brackets already interleaved into `nameParts`; the
   fallback handles them, and the tests prove it. If the backend fixtures are ever
   regenerated against the new API, they will start carrying `nameBreaks` and should be
   re-checked then.

## Next steps

1. Review the PR.
2. Decide finding 1 — keep it stacked on #774, or re-cut from `master` to decouple the
   deploy from #774's merge.
3. Merge #774, then retarget this PR to `master` (finding 2).
4. Delete the task docs (finding 5).
5. Merge and deploy **this** before ebl-api #743.

## Environment notes

- **Node 20 is required**, not 22. This workspace already runs 20.20.2, matching
  `.nvmrc`. On Node 22 both `yarn install` and husky's pre-commit hook die with
  `The engine "node" is incompatible`.
- **Use `yarn`, never `npm`.** There is no `package-lock.json`.
- The brief's section 11 push blocker (a token scoped to `ebl-api`) does **not** apply
  here — this workspace is the `ebl-frontend` repo and its token can push.
