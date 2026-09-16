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

## CI

The first push went red on the `test` check. The cause was **pre-existing and unrelated
to this change**: `FragmentService.queries.test.ts` compared two Promise _objects_ with
`toEqual`, which asserted nothing at all. PR #774 removed the bluebird import that had
been masking it, and CI's `--detectOpenHandles` flag enables `async_hooks`, which stamps
differing `async_id_symbol` properties onto native promises — so the empty assertion
finally broke.

Fixed by awaiting the promise and comparing resolved values. The whole CI job now
reproduces green locally: bluebird check, `yarn lint`, `yarn tsc`,
`yarn test --coverage --forceExit --detectOpenHandles --watch=false`, and `yarn build`.
Details in `TASK-749-log.md`.

> [!NOTE]
> That fix is a base-branch defect repaired from this PR. If #817 is ever re-cut from
> `master` (see finding 1), the same fix must travel with it — on `master` the file still
> imports bluebird, so it is latent there rather than failing.

## Review pass (2026-09-16)

PR #817 was reviewed at head `f18d0ce5`. Full write-up in `TASK-749-review.md`, working notes in `TASK-749-log.md`.

Nothing pre-existing had to be reconciled: 0 review events, 0 inline comments, 0 issue comments, 0 requested reviewers. No review bot is configured in this repository. All CI checks are green, including CodeQL and the `qlty check` status. **No dev container changes** in this PR or anywhere in the stack.

Eight findings were raised. Three were fixed, one was withdrawn as incorrect, two remain open, two are informational.

### Fixed in this branch

- **F2 — the `extractEnclosureTypes` change was unpinned.** Routing it through `nameTokens` is what keeps the image-annotation tool's broken-sign classification correct, but no test covered it: reverting that line left the entire suite green at 500 suites / 4402 tests. Two assertions were added to `token.test.ts` using a name whose parts both carry `BROKEN_AWAY` and whose break does not. The same mutation now fails both.
- **F3 — surplus `nameBreaks` were silently discarded.** `nameTokens` is now `_.zip(nameParts, nameBreaks).flatMap(...)`, which mirrors the backend's `zip_longest` one-for-one and drops the index arithmetic. Shorter than the original, which mattered: `token.ts` sits at 247 of the 250-line ceiling.
- **F5 — three ad-hoc `NamedSign` fabricators, all via `as unknown as`.** Replaced by `src/test-support/named-sign-fixtures.ts`, fully typed with zero casts. Both test files migrated; the two relative imports the patch had touched in `accents.test.ts` were normalised to alias paths.

### Withdrawn

- **F4 — the `pendingResult` variable in `FragmentService.queries.test.ts` is not redundant.** Inlining it fails lint with `testing-library/no-await-sync-queries`, which matches any `await ...queryBy*(...)` call and mistakes the service method for a Testing Library query. The variable is a deliberate workaround. **Do not "simplify" it.**

### Verified against the running application

Chrome 131 against the dev server, with the entry point temporarily pointed at a harness rendering the real `DisplayToken`:

| `addAccents` implementation          | New shape                           | Legacy shape |
| ------------------------------------ | ----------------------------------- | ------------ |
| `nameTokens(namedSign)` — as shipped | `k]u`                               | `k]u`        |
| `namedSign.nameParts` — pre-PR       | **`ku`** — bracket silently dropped | `k]u`        |

The negative control reproduces the actual bug in a browser and shows the fix curing it. Harness reverted afterwards.

## Findings that remain to address

1. **Task docs must be deleted before merge — the blocker.** Per the project's cleanup rule and the explicit "no new `.md` files" requirement. `TASK-749-*` (now 9 files: the original 6 plus `-review.md`, `-todo.md`, `-log.md`), `TASK-774-*` (5), `TASK-ts7-*` (3). Seventeen files reach `master` if nobody intervenes. Note `TASK-749-frontend.patch` is a verbatim, already-stale copy of the source diff. Consider a `.gitignore` entry for `TASK-*.md` / `TASK-*.patch` in both repositories — the same files were committed to ebl-api#743.

2. **Deploy order vs. the stacked base — the one to actually think about.** The brief is emphatic that this frontend change must be live _before_ ebl-api #743, because the moment #743 deploys, every un-updated client starts silently dropping brackets. Basing this PR on `chore/remove-bluebird` couples its release to #774 merging first. If #774 has any runway left, consider cutting this from `master` instead so the two can move independently.

   If it is re-cut, take **both** `d506a0de` and `f18d0ce5` (plus the review-pass commit). Cherry-picking the feature commit alone leaves behind the `FragmentService.queries.test.ts` repair, which is a base-branch defect fixed from here — on `master` the file still imports bluebird, so the bug is latent there rather than failing.

3. **PR base needs retargeting.** The PR targets `chore/remove-bluebird`. Once #774 merges, retarget it to `master`, or it cannot merge.

4. **Narrow the types once ebl-api#743 is deployed everywhere.** `nameParts` keeps `readonly (ValueToken | Enclosure)[]` while the backend has narrowed to `Sequence[ValueToken]`. That is deliberate — narrowing would break the legacy fallback, which is what lets the two repositories deploy independently — but it is a temporary deviation with no expiry attached. When the fallback can go: narrow `nameParts` to `readonly ValueToken[]`, make `nameBreaks` required, and delete the `if (!nameBreaks)` arm. Worth a ticket now.

5. **Browserslist advisory — pre-existing.** Every test run prints `Browserslist: browsers data (caniuse-lite) is 8 months old`. It is a craco banner printed before any test runs, not `console.error`/`console.warn` from a test, and it is unrelated to this change. Clearing it means `npx update-browserslist-db@latest`, which rewrites `yarn.lock` — a dependency bump deliberately kept out of a focused stacked PR. **Schedule it separately** so the console-clean gate is not permanently carrying a known exception.

6. **`accents.ts` branch coverage 85%** (lines 57-61, 132) — pre-existing. The `?? letter` fallbacks in `addGraveAccent`/`addAcuteAccent` and the `|| c` fallback in `addBreves`. Untouched by this patch, in functions this change never calls. `accents.ts` is not in craco's `fullyCoveredPaths`, so no per-file 100% threshold applies. The **affected** code is fully covered.

7. **GitHub Actions Node 20 deprecation warning.** The runner warns that `actions/checkout@v4` and `actions/setup-node@v4` target Node 20 but are forced onto Node 24. This is about the _action runtime_, not the project's Node version. A warning, not a failure, affecting every workflow run in the repo. Bumping those actions to `@v5` is a housekeeping PR of its own.

8. **`src/test-support/` fixtures were intentionally left alone.** They carry legacy-shaped payloads with brackets already interleaved into `nameParts`; the fallback handles them, and the tests prove it. If the backend fixtures are ever regenerated against the new API they will start carrying `nameBreaks` and should be re-checked then. The new `named-sign-fixtures.ts` is the place to build those from.

## Next steps

1. **Decide finding 2** — keep it stacked on #774, or re-cut from `master` to decouple the deploy. This is the only decision that changes anything else.
2. Merge #774, then retarget this PR to `master` (finding 3).
3. **Delete the task docs** (finding 1) — all seventeen, including this handoff.
4. Merge and deploy **this** before ebl-api #743.
5. Open tickets for findings 4, 5 and 7. None of them block.

## Environment notes

- **Node 20 is required**, not 22. This workspace already runs 20.20.2, matching
  `.nvmrc`. On Node 22 both `yarn install` and husky's pre-commit hook die with
  `The engine "node" is incompatible`.
- **Use `yarn`, never `npm`.** There is no `package-lock.json`.
- The brief's section 11 push blocker (a token scoped to `ebl-api`) does **not** apply
  here — this workspace is the `ebl-frontend` repo and its token can push.
