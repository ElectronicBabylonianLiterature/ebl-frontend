# TASK-767 — Review: PR #767 "Add realia annotation layer to named entity annotation"

- **PR**: <https://github.com/ElectronicBabylonianLiterature/ebl-frontend/pull/767>
- **Head reviewed**: `8eb7643be39554a827fe73c9df826b5b49761354` (round 4)
- **Base**: `master` — 184 files changed, +20461 / −11101
- **Author**: `khoidt` · **Review decision**: `CHANGES_REQUESTED` · **Merge state**: `BLOCKED`
- **Working tree**: clean; the head is pushed and CI has run against it.
- **Status**: every in-repository code finding is **resolved**. Two housekeeping findings
  (**N3**, **N4**) and the external blocker **F10** are **open**.

## Summary

Realia annotations are a second annotation layer running in parallel to the named-entity
layer. The two kinds stay structurally apart end to end — separate fields on the DTO, on
`AnnotationSpans`, in the reducer, in props and in each lookup, rendered by two separate
`SpanIndicators` passes. `layer` is a required discriminant, so `isRealiaAnnotationSpan`
narrows both branches with no cast. `tier`, `name` and `layer` are stripped by the single
helper `omitDerivedSpanFields` at the one place that builds the outbound payload.
`realiaInfo` is embedded in the fragment response and never echoed back.

Round 3 is now **committed and pushed** (`f93df643`, `8eb7643b`), which closes the previous
round's action item 2. CI on the head is fully green. All seven points from the reviewer's two
`CHANGES_REQUESTED` reviews were re-verified fixed on `8eb7643b`, file by file — see the
point-by-point table below.

This round adds no new code findings. `qlty check` over all 184 changed files reports no
issues, no changed `.ts`/`.tsx` file exceeds 250 lines, and the logic the two layers have in
common is factored into single helpers (`useSpanIndicator`, `omitDerivedSpanFields`,
`SpanIndicators`, `createRealiaOptionLoader`) rather than duplicated per layer.

**The one blocker is still external and unchanged: `ebl-api` #740 is open, unmerged, and now
also has merge conflicts.** Until it ships, this PR breaks saving on the _existing_
named-entity feature — see **F10**, whose scope is corrected below.

## CI Status

### Remote checks on head `8eb7643b`

Every check run and commit status was fetched from the GitHub API. **No check is failing.**

| Check                         | Status    | Conclusion  |
| ----------------------------- | --------- | ----------- |
| `test`                        | completed | **success** |
| `CodeQL`                      | completed | **success** |
| `Analyze (javascript)`        | completed | **success** |
| `GitGuardian scan` (×2)       | completed | **success** |
| `GitGuardian Security Checks` | completed | **success** |
| `docker`                      | completed | skipped     |
| `docker-test`                 | completed | skipped     |

| Commit status        | State       | Description            |
| -------------------- | ----------- | ---------------------- |
| `qlty check`         | **success** | No blocking issues     |
| `qlty coverage diff` | **success** | 100.0% (75% threshold) |
| `qlty coverage`      | **success** | 94.0% (+0.9% change)   |

Combined commit status: **success**. `mergeable_state` is `BLOCKED` solely because of the
outstanding `CHANGES_REQUESTED` review, not because of a failing check.

### Local gates on `8eb7643b`

| Gate                             | Result                                                                                                       |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `yarn lint`                      | **exit 0** — no eslint or stylelint errors                                                                   |
| `yarn tsc`                       | **exit 0** — no type errors                                                                                  |
| `yarn test --watchAll=false`     | **exit 0** — 405/405 suites, 3863 passed, 2 skipped, 50 snapshots, 413.7 s                                   |
| Console output in the test run   | **zero** — no `console.error`/`console.warn`, no `Warning:`, no unhandled rejection, no "not wrapped in act" |
| `qlty check` (184 changed files) | **✔ No issues**                                                                                              |
| 250-line ceiling                 | **0 files** in the changed set exceed 250 lines                                                              |

### qlty issues

`qlty check` was run locally over the exact changed-file list
(`git diff --name-status origin/master...HEAD | grep -E '^[AM]'`, 184 files) and separately
over the five directories the feature touches. Both runs report **✔ No issues**. The remote
`qlty check` commit status agrees ("No blocking issues"). The qlty web UI requires a login, so
the authoritative signals used here are the commit status and the local CLI run.

The five historical `qltysh[bot]` inline comments (4 × `similar-code`, 1 × `boolean-logic`) are
all **resolved and outdated** — they point at line ranges that no longer exist.

## Comment status tracking

### Inline review threads — 5 total, **5 resolved, 0 unresolved**

| Thread                    | Author        | Path                                 | Resolved | Outdated |
| ------------------------- | ------------- | ------------------------------------ | -------- | -------- |
| T1 similar-code (mass 84) | `qltysh[bot]` | `TextAnnotationContext.test.tsx:105` | resolved | outdated |
| T2 similar-code (mass 84) | `qltysh[bot]` | `TextAnnotationContext.test.tsx:121` | resolved | outdated |
| T3 similar-code (mass 92) | `qltysh[bot]` | `TextAnnotationContext.test.tsx:157` | resolved | outdated |
| T4 similar-code (mass 92) | `qltysh[bot]` | `TextAnnotationContext.test.tsx:175` | resolved | outdated |
| T5 boolean-logic          | `qltysh[bot]` | `cssCascade.testSupport.ts:110`      | resolved | outdated |

General / issue comments on the PR: **0**.

### Timeline review events — 5 total

| Review     | Author        | State             | Commit     | Status                                           |
| ---------- | ------------- | ----------------- | ---------- | ------------------------------------------------ |
| 4686217547 | `qltysh[bot]` | COMMENTED         | `f37f6df0` | superseded                                       |
| 4703525359 | `qltysh[bot]` | COMMENTED         | `123f5f3a` | superseded                                       |
| 4753665596 | `Fabdulla1`   | APPROVED          | `b4b16fe5` | superseded                                       |
| 4753712550 | `Fabdulla1`   | CHANGES_REQUESTED | `b4b16fe5` | both points fixed, re-verified on `8eb7643b`     |
| 4815952885 | `Fabdulla1`   | CHANGES_REQUESTED | `7d5015e2` | all five points fixed, re-verified on `8eb7643b` |

**Blocker for approval:** review `4815952885` still reads `CHANGES_REQUESTED` and is the only
reason `mergeable_state` is `BLOCKED`. It was submitted against `7d5015e2`; every point it
raises was fixed in the two commits after it. Clearing it needs a fresh look from the
reviewer, not a code change. No reviewers are re-requested by this review — reviewer
assignment is the author's to make.

Outstanding review requests: **none**.

#### Point-by-point re-verification on `8eb7643b`

| #   | Reviewer's point                                              | Verified at                                                                                                                                                                                                                                                                                        |
| --- | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Toggle said "Toggle named entities" but controls both layers  | `FragmentDisplaySettings.tsx:96` — `title={'Toggle annotations'}`. See **N5** for the residual a11y nit.                                                                                                                                                                                           |
| 2   | Workflow test: both arrays submitted, derived fields stripped | `TextAnnotation.save.test.tsx:37-56` — asserts the exact `{ namedEntities, realia }` payload and that `tier`/`name`/`layer` are absent.                                                                                                                                                            |
| 3   | `any` + eslint-disable in `injectedApp.testSupport.tsx`       | Replaced by the structural `MockedConstructorCalls` interface (`injectedApp.testSupport.tsx:36-48`). No `no-explicit-any` suppression in any file this PR adds or edits.                                                                                                                           |
| 4   | `RealiaSelect` rejection / stale-response race / unmount      | `realiaOptionLoader.ts:53-93` — `latestRequestId` ordering guard, `isDisposed` flag set by `cancel`, rejections routed through the same `respond`; `RealiaSelect.tsx:34` calls `loadOptions.cancel` on unmount.                                                                                    |
| 5   | Refresh failure reported as a save failure                    | `fragmentServiceBase.ts:141-158` resolves `{ fragment, refreshError }`; `SpanAnnotationDisplay.tsx:54-58` advances the saved baseline on persistence and surfaces the refresh problem as a separate warning. `TextAnnotation.saveOutcomes.test.tsx` covers all five scenarios the reviewer listed. |
| 6   | `useAnnotationContext` seeded once at mount                   | `TextAnnotation.tsx:73` — `{ watch: (props) => [props.number] }`; `withData.tsx:41` sets `data` to `null` before refetching, so the view unmounts and remounts. `TextAnnotation.fragmentChange.test.tsx:106-114` proves the reseed.                                                                |
| 7   | No negative assertions for Word / PDF export                  | `export.annotations.test.ts` — renders the exporters' tree with `RouterLinkModeContext={false}` and asserts none of six annotation markers appear, plus a static guard that the three export modules never wire `NamedEntityPreview`.                                                              |

## Findings

### F10 — Merging before `ebl-api` #740 breaks saving on the existing named-entity feature — **Blocker (external) · OPEN**

Re-verified against `ebl-api` `master` during this review. PR #740 ("Realia annotation API:
resolve realiaInfo on every fragment-returning route") is **open, unmerged, and now
`mergeable_state: dirty`** — it has merge conflicts that must be resolved before it can land.

On `ebl-api` `master`, `ebl/fragmentarium/web/named_entities.py` still has
`on_post: data = req.media["annotations"]`. This PR changes the client payload from
`{ annotations: [...] }` (what `master` sends today) to `{ namedEntities, realia }`
(`fragmentRepositoryUpdates.ts:143-153`). Against the deployed API that is a `KeyError` — a
**500, not a 422** — so **saving any named-entity annotation fails**, including annotations
that have nothing to do with realia. That is a regression to a shipped feature, not an
incomplete new one.

**Scope correction to the round-3 write-up.** The earlier version of F10 also claimed that
every existing named-entity annotation would _read_ as empty. That no longer holds. After the
N1 fix the editor stops calling `GET /fragments/{number}/named-entities` and derives its state
from the fragment response instead, and `ebl-api` `master`'s `fragment_schema.py:109` already
dumps `named_entities` under `data_key="namedEntities"`. The read path therefore degrades
gracefully on the current API: `namedEntities` loads, while `realia` and `realiaInfo` are
absent and fall back to `[]` / `emptyRealiaInfoEntries`. **The read regression is gone; the
save regression remains.**

**Client/backend field names are aligned** with #740's target schema — `id`, `type`, `span`
for entity spans and `id`, `realiaId`, `span` for realia spans match `named_entity_schema.py`
on the `add-realia-annotation-api` branch, and `RealiaInfoEntry { realiaId, lemma, type }`
matches the DTO that branch adds. No client-side aliases were introduced.

This is outside this repository, so it is recorded rather than fixed.

### N3 — The PR description no longer matches the branch — **Minor · FIXED**

The description's "Changes outside the realia feature" section described work that is not in
the branch:

- It claims three new sections in `.github/copilot-instructions.md` and new `.husky/pre-commit`
  / `.husky/pre-push` hooks. Both were reverted in round 3 (finding F7):
  `git diff origin/master...HEAD -- .github .husky` is **empty**.
- It points readers at `TASK-realia-annotation-todo.md` and `TASK-pr767-review.md`. Neither
  file exists; the task docs are named `TASK-767-*.md`.
- It states that six edited files are over the 250-line ceiling and "recorded in
  `TASK-pr767-review.md` (F13) as separate work". All six were split in round 3 and are now
  under the ceiling — `FragmentService.ts` 246, `FragmentRepository.ts` 234, `SignImages.tsx`
  199, `FragmentService.test.ts` 211, `FragmentRepository.test.ts` 171, `fragment.ts` 214.

A reviewer reading the description would look for changes that are not there and mis-scope the
review.

**Fix.** The description was rewritten against `8eb7643b` (`PATCH /repos/.../pulls/767`). The
`.github/copilot-instructions.md` and `.husky` paragraphs are gone, as are the references to
the two task files that do not exist. The `SignImages.tsx` paragraph now names where the
`TS18046` fix actually lives after the split (`task: (item: T) => PromiseLike<R>` in
`signImageGrouping.ts`). The "Line counts" section is inverted: it now states that every file
in the changed set is at or under the ceiling, with a table of the six that were split and the
modules each was extracted into. Every file and number in the new body was verified against
the branch before it was posted. The description also now covers two behavioural changes it
had never mentioned — the single-request editor load and the persistence/refresh split — and
gives the `ebl-api` #740 dependency its own section rather than a closing sentence.

### N4 — The task-tracking docs are tracked on the branch and would merge into `master` — **Minor · OPEN**

`TASK-767-todo.md` (93 lines), `TASK-767-log.md` (378) and `TASK-767-review.md` (this file) are
committed on `add-realia-annotation`, absent from `master`, and not covered by `.gitignore`.
Merging the PR as it stands publishes all three to `master`. They are working artefacts and
must be deleted in a final commit before merge.

### N5 — The annotation toggle's accessible name is a kebab-case identifier — **Minor · FIXED**

`FragmentDisplaySettings.tsx:96-97` set `title={'Toggle annotations'}` and
`aria-label={'toggle-annotations'}`. `aria-label` wins for the accessible name, so a screen
reader announced the literal string "toggle-annotations" rather than the readable title — the
half of the reviewer's original point about screen readers that the title change did not
cover.

**Fix.** `aria-label` is now `'Toggle annotations'`, matching the `title`. The five
`Display.test.tsx` assertions that queried the old label were updated, and the one
`Display.test.tsx.snap` entry was refreshed with `--updateSnapshot` scoped to that file; the
snapshot diff is the single `aria-label` line and nothing else.

This does leave the control inconsistent with the kebab-case labels around it
(`annotate-named-entities`, `save-annotations`, `delete-name-annotation`, `edit-realia`), which
is why it was originally filed as an observation rather than a required change. Those labels
are test hooks that happen to sit in the `aria-label` attribute; converting them all is a
separate, larger change, and worth doing — the right end state is `data-testid` for the test
hooks and readable prose in `aria-label` throughout.

### Resolved in earlier rounds — re-verified on `8eb7643b`

| Id  | Finding                                                    | Verification on this head                                                                                                            |
| --- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| N1  | Editor round-tripped for data the fragment already carries | `TextAnnotation.tsx` calls only `fragmentService.find`; `fetchNamedEntityAnnotations` is gone from the service, repository and port. |
| N2  | Comment added against the no-comments rule                 | No added explanatory comments in the diff outside `eslint`/`camelcase` directives.                                                   |
| F6  | Files over the 250-line ceiling                            | Sweep over every added/modified `.ts`/`.tsx` prints nothing.                                                                         |
| F7  | Repository-policy changes bundled in a feature PR          | `git diff origin/master...HEAD -- .github .husky` is empty.                                                                          |
| F9  | `Fragment` constructor at 34 parameters                    | `fragment.ts` takes a single `FragmentProps`; the file is 214 lines.                                                                 |

F1–F5 and F8 from the first round were fixed in `f93df643` and are covered by the
point-by-point table above.

### Not applied, with reasons

**`TestData`'s 6-parameter constructor** (`src/test-support/utils.ts`) is the only remaining
`qlty smells` finding. It is pre-existing, non-blocking on remote `qlty check`, and converting
it to a parameter object would rewrite every `new TestData(...)` call site across a dozen
unrelated test files, dragging them into the changed set and under the 250-line and coverage
gates. Left alone deliberately.

## Severity

| Id  | Finding                                                    | Severity               | Status              |
| --- | ---------------------------------------------------------- | ---------------------- | ------------------- |
| F10 | `ebl-api` #740 unmerged — saving named entities 500s       | **Blocker (external)** | **Open**            |
| —   | `CHANGES_REQUESTED` review `4815952885` still standing     | **Blocker (process)**  | **Open**            |
| N4  | `TASK-767-*.md` tracked and would merge into `master`      | Minor                  | **Open**            |
| N3  | PR description does not match the branch                   | Minor                  | Fixed               |
| N5  | Toggle's accessible name is a kebab-case identifier        | Minor                  | Fixed               |
| N1  | Editor round-tripped for data the fragment already carries | Major                  | Fixed               |
| F6  | Files over the 250-line ceiling                            | Major                  | Fixed — none remain |
| N2  | Comment added against the no-comments rule                 | Minor                  | Fixed               |
| F7  | Repository-policy changes bundled in a feature PR          | Minor                  | Fixed               |
| F9  | `Fragment` constructor at 34 parameters                    | Minor                  | Fixed               |

**Console noise: none.** No `console.error`, `console.warn`, `Warning:`, unhandled rejection or
"not wrapped in act" output appears anywhere in the 405-suite local run, so no console-noise
finding is raised.

## Reproduction Steps

**F10** — point the frontend at an `ebl-api` deployment built from `master`. Open the
named-entity annotation tab of a fragment, add or delete a **named-entity** tag (no realia
needed) and press Save. `POST /fragments/{number}/named-entities` is sent with body
`{ namedEntities, realia }`; the handler evaluates `req.media["annotations"]` and raises
`KeyError`, returning **500**. The same action on `master` succeeds. Reading the fragment still
works: `namedEntities` is present on the fragment DTO, while `realia` and `realiaInfo` are
absent and fall back to empty.

**N3** (before the fix) —

```sh
git diff origin/master...HEAD --stat -- .github .husky   # empty
ls TASK-realia-annotation-todo.md TASK-pr767-review.md   # No such file or directory
```

Then read the "Changes outside the realia feature" section of the PR description, which
described both as present. The rewritten description no longer does.

**N4** —

```sh
git ls-tree HEAD --name-only | grep TASK          # three files
git ls-tree origin/master --name-only | grep TASK # none
grep TASK .gitignore                              # no match
```

**N5** (before the fix) — open a fragment display, turn on a screen reader, and move to the
annotation toggle in the display settings. It was announced as "toggle-annotations"; it is now
announced as "Toggle annotations".

## Recommendation

**Do not merge yet.** Two blockers stand, neither of them a code defect in this repository.

The code is in good shape: every point from both `CHANGES_REQUESTED` reviews is fixed and was
re-verified line by line on this head; `lint`, `tsc` and the full local suite are clean with
zero console output; remote CI is green including `qlty check` and 100% diff coverage; no
changed file exceeds 250 lines; and the two layers share single helpers rather than duplicated
logic.

What holds it back is **F10** — until `ebl-api` #740 is merged _and deployed_, this PR makes
saving named-entity annotations fail with a 500 on a feature that works today — and the
standing `CHANGES_REQUESTED` review, which only the reviewer can clear. **N3** and **N5** were
fixed in this round; **N4** is a one-line commit that must not be forgotten.

## What Has To Be Done

1. **[Blocker · F10 · outside this repository]** Get `ebl-api` PR #740 merged **and deployed**
   before #767 merges. It currently has merge conflicts (`mergeable_state: dirty`) that must be
   resolved first. Then confirm on the deployed API that
   `POST /fragments/{number}/named-entities` accepts `{ namedEntities, realia }` and that a
   fragment response carries `namedEntities`, `realia` and `realiaInfo`.
2. **[Blocker · process]** Clear the outstanding `CHANGES_REQUESTED` review `4815952885` from
   `Fabdulla1`. All five of its points, and both points of the earlier review `4753712550`, are
   addressed on `8eb7643b`; the point-by-point table above gives the file and line for each.
   Reviewer assignment is the author's to make — this review does not add or re-request
   reviewers.
3. **Commit the round-4 changes.** `FragmentDisplaySettings.tsx`, `Display.test.tsx`,
   `Display.test.tsx.snap` and the three `TASK-767-*.md` files are modified in the working tree
   and **uncommitted**, so CI has not seen them. Commit and push, then confirm the checks on
   the new head.
4. **[N4] Before merge**: delete `TASK-767-todo.md`, `TASK-767-log.md` and `TASK-767-review.md`
   in a final commit, so they do not land on `master`.
5. **[Follow-up, optional]** The remaining `aria-label` values in the annotation UI
   (`annotate-named-entities`, `edit-named-entity`, `edit-realia`, `save-annotations`,
   `delete-name-annotation`, `update-name-annotation`) are still kebab-case test hooks sitting
   in an accessibility attribute. Moving them to `data-testid` and giving each control readable
   prose is worth its own PR; it is out of scope here because it reaches beyond this PR's diff.
6. **[Optional]** Decide whether `TestData`'s 6-parameter constructor deserves its own
   refactor. Not worth doing inside this PR — see the finding.

### Done in round 4

- **N3** — the PR description was rewritten against `8eb7643b` and now matches the branch.
- **N5** — the annotation toggle's `aria-label` is the readable `'Toggle annotations'`; the
  five `Display.test.tsx` queries and the one snapshot entry were updated with it.
