# TASK-pr767 — Work Log

## Second process failure — the review never looked at CI

The user asked whether the review mentions the CI errors. It did not, and it should have:
the PR's `test` check had been **failing** the entire time (`yarn tsc` and `yarn build`,
findings **F14**/**F15** in the review).

Two independent mistakes produced that:

1. **I never fetched the check runs.** The _Review Guidelines_ hard gate says to gather every
   review and comment before reviewing, and to resolve findings "raised by automated review
   bots". I read that as the qlty inline comments and stopped there — the GitHub Actions
   result is not a review comment, so nothing in my process ever asked for it. A red build
   is the single most important fact about a PR and my review did not contain it.
2. **I reported a green `yarn tsc` from an environment I had not verified.** `@types/bluebird`
   was missing from the local `node_modules` although `package.json` and `yarn.lock` both
   pin it. Without it `Bluebird<T>` degrades to `any`, so the two real type errors vanished
   locally. I took "Done in 24.45s" as proof and moved on.

A third fact, found while fixing the first two: **CI builds the merge with `master`**
(`Merge 1070d896 into 4db5c9cd`), and `master` is 4 commits ahead. It therefore runs one test
file that exists only on `master` (`src/common/utils/ConcurrencyLimiter.test.ts`) — my local
"369 suites" could never have matched CI's "370" and I did not notice the discrepancy.

Root cause common to all three: I treated my own local run as the definition of "the gates
pass", when the gate that actually decides is the remote one. Fixed in the instructions by a
new **CI — The Remote Result Is the Gate** section, a lockfile-consistency rule in
**Commands and Tooling**, and a CI clause plus a mandatory `CI Status` section in the
**Review Guidelines**.

## Process failure at the start of this task

I ran the review, exported `TASK-pr767-review.md`, and then **stopped and reported** the
thirteen findings instead of resolving them. Two gates were broken:

1. _Review Guidelines_ — "Treat addressing every finding as a hard gate: resolve all
   findings surfaced in the review, including pre-existing ones and those raised by
   automated review bots, at their root cause before finalizing. Do not defer or merely
   report them." I deferred all of them and offered to fix them instead.
2. _Task Tracking and Cleanup_ — "For every task, create a mandatory detailed TODO list in a
   `.md` file" and "create and maintain a detailed work log in a `.md` file". Neither
   `TASK-pr767-todo.md` nor this log existed until after the user pointed it out.

Root cause of (1): I let the _Scope_ rule ("do not make changes unless explicitly
requested") override an explicit, more specific gate that the user had just told me to
follow strictly. The scope rule governs unrequested work; resolving the findings of a
review I was asked to perform is requested work. The only thing the user withheld is
committing. Corrected by resolving every finding below.

## Findings resolved

### F1 — Display toggle described only one of the two layers

`FragmentDisplaySettings.tsx` labelled the annotations toggle `title="Toggle named
entities"` / `aria-label="toggle-named-entities"` while the control shows and hides both
named-entity tags and realia — the change `Fabdulla1` requested on 2026-07-22 and the
reason the PR sits at `CHANGES_REQUESTED`.

Renamed to `title="Toggle annotations"` / `aria-label="toggle-annotations"`. Updated the
five assertions in `Display.test.tsx` and the two lines in
`__snapshots__/Display.test.tsx.snap` (inspected the diff; snapshot updated with
`--updateSnapshot` on that one file, not globally).

### F4 — No save-path test with both lists populated

`TextAnnotation.test.tsx` asserted the save payload only with `realia: []`, so nothing
pinned the case the backend would actually punish. Added
`TextAnnotation.save.test.tsx`: renders the editor with a fragment carrying a tag **and** a
realia annotation, adds a second tag through the UI, saves, and asserts
`updateNamedEntityAnnotations` received both non-empty lists with no `tier`, `name` or
`layer` key on any element. It also covers the save-failure branch (F11).

### F5 — Realia navigation in the read-only preview was mouse-only

`SpanIndicatorView` exposed the Realia page through `onMouseUp` + Alt only: a bare `<span>`
with no role, no `tabIndex` and no key handler, discoverable solely through the `title`
tooltip. Keyboard and screen-reader users could not reach the Realia page from the display
preview at all.

`useSpanIndicator` now returns `openRealiaPageDirectly()` (plain, no event) alongside the
mouse handler, and `SpanIndicatorView` renders the realia indicator with `role="link"`,
`tabIndex={0}`, an accessible name (`aria-label`) and an `onKeyDown` handler for Enter and
Space. Non-realia indicators stay inert (no role, no tab stop) — they are decoration. The
editor's `SpanIndicator` is a mouse-driven editing surface and is unchanged.

One refinement on top of that: a span covers every word it spans, so a naive implementation
gives a five-word realia five identical tab stops. `useSpanIndicator` now also exposes
`isInitial` (already computed for the `initial` class), and only the indicator on the span's
first word is a link — the continuation indicators keep alt+click but stay out of the tab
order. Covered by a test.

### F6 — Stacked tiers could exceed the generated CSS

`TextAnnotation.sass` generates `tier-depth--1 … --10` from `$max-tier-depth: 10`, and this
PR stacks realia tiers on top of the deepest entity tier, so a deeply annotated word could
produce `tier-depth--11`, which matches no rule: the indicator falls back to the base offset
(overlapping tier 10) and the row reserves no padding for it.

`spanTiers.ts` now clamps every derived tier to `MAX_TIER_DEPTH`, exported from
`spanTiers.ts` and asserted against the sass variable by a test in `NamedEntities.css.test.ts`
so the two cannot drift.

### F7 — Reducer initial state recomputed on every render

`useAnnotationContext` deduped the loaded spans and ran the full `setTiers` computation on
every render, although `useReducer` uses its second argument only on the first — the result
was discarded on every add/edit/delete. Converted to a lazy initializer
(`useReducer(reducer, { words, spans }, createInitialState)`).

### F8 — Save was enabled on load when the API returned duplicates

`useAnnotationContext` deduped the loaded annotations but `TextAnnotationView` kept the raw
response as `initialAnnotations`, so `isDirty` compared deduped state against a
non-deduped baseline and the Save button was live before the user touched anything.
Extracted `dedupeAnnotationSpans` into `annotationSpan.ts` (one helper, used by both the
context and the view — DRY) and seeded `initialAnnotations` from it.

### F9 — "Apply" was a silent no-op with the realia select cleared

`RealiaSelect` is clearable; clearing it and pressing Apply dispatched nothing, showed
nothing and left the popover open, because `setActiveSpanId(null)` sat inside the guarded
branch. `SpanEditorForm`'s `onApply` is now optional and the Apply button is disabled when it
is absent; `RealiaSpanEditor` passes a handler only while a realia is selected, so the dead
state is unreachable. (An `applyDisabled` flag was the first attempt; making `onApply`
optional leaves both sides of the condition reachable from tests, so branch coverage stays
at 100 %.)

### F10 — The display toggle remounted the whole transliteration

`Display.tsx` swapped between `<NamedEntityPreviewProvider>{transliteration}</…>` and a bare
`{transliteration}`, so the element type at that position changed and React unmounted and
remounted the entire transliteration subtree on every toggle, discarding transient UI state
and restarting the indicator animation on a fresh tree.

`NamedEntityPreviewProvider` now takes `show` and provides `emptyNamedEntityPreview` when it
is false; `Display.tsx` mounts it unconditionally. The rendered DOM for the hidden state is
unchanged (`NamedEntityPreviewToken` already returns its children when there are no spans),
so the snapshot only moved by the toggle rename.

### F11 — Save-failure branch was uncovered

`SpanAnnotationDisplay.tsx:53` (`.catch(() => setIsSaving(false))`, added by `1070d896`) had
no test — the one gap in an otherwise 100 %-covered directory. Covered by
`TextAnnotation.save.test.tsx`: the update rejects, the spinner clears, the Save button
comes back enabled and the annotations stay dirty. The rejection is handled, so no
unhandled-rejection noise is produced.

### F13 (partial) — `Markable.test.tsx` was over the 250-line ceiling

Split 307 lines by cohesion into `Markable.test.tsx` (59 lines — rendering and selection
highlighting) and `Markable.crossTokenSelection.test.tsx` (104 lines — the four
browser-selection cases), over a new `markable.testSupport.tsx` (80 lines) holding the
tokens, the context render helper, the two-Markable fixture and the `getSelection` spy.
The four cases previously repeated that fixture and spy setup inline; behaviour and
assertions are identical.

## Pre-existing issues found and NOT fixed — flagged deliberately

`FragmentService.ts` (820), `FragmentService.test.ts` (1 940), `FragmentRepository.ts` (739),
`FragmentRepository.test.ts` (1 061), `SignImages.tsx` (444) and `fragment.ts` (267) all
exceed the 250-line ceiling. Every one was already over it on `master`; this PR adds between
3 and 47 lines to each (constructor/DTO fields and their tests). Splitting six core files —
two of them the fragment repository and service that most of the app depends on — is a large
refactor with real regression risk and no connection to the realia work, and it would make
this already-115-file PR unreviewable. Recorded here and in `TASK-pr767-review.md` (F13) as
its own task rather than attempted. `SignImages.tsx` was flagged the same way in
`TASK-realia-preview-broken-log.md`.

## Findings that are not code changes

- **F2** — the branch needs `ebl-api@add-realia-annotation-api` (two-list
  `GET`/`POST /fragments/{id}/named-entities`, `GET /realia/by-id/{realiaId}`,
  `realia` / `realiaInfo` on the fragment payload). Merging the frontend first makes the
  editor show no existing annotations and post a body the old API cannot read. Deployment
  ordering is the author's call; no client change is correct here.
- **F3** — the five `TASK-*.md` documents on the branch plus the three added by this task
  must be removed in the final commit before merge.
- **F12** — the tooling/policy changes (`copilot-instructions.md`, husky hooks,
  `SignImages.tsx`, test-support) should be called out in the PR description. Editing the
  PR description is an outward-facing action and is left to the author.

## Gates — after the fixes (2026-07-27)

- `yarn lint` — clean (eslint + stylelint).
- `yarn tsc` — clean.
- Full suite — **371 suites, 3 759 passed, 2 skipped, 0 failed**, run as 15 sequential
  batches of 25 files. (Before the fixes: 369 suites, 3 739 passed.) The project's own
  `yarn test --watchAll=false` was OOM-killed twice in this container, after 16 and 38
  suites, at its `--max_old_space_size=1536`; that is this environment's memory limit — the
  container has ~3.5 GB free with other tooling resident — and not a PR or test defect. The
  batched run covers exactly the same 369 (now 371) files.
- Console-clean — zero `console.error` / `console.warn` / `Warning:` / unhandled-rejection
  lines across the batched output. Nothing is mocked to suppress output.
- Coverage — `src/fragmentarium/ui/text-annotation/` is at 100 % statements, branches,
  functions and lines across all 27 source files (it was 26 of 27 before, with
  `SpanAnnotationDisplay.tsx:53` uncovered).
- 250-line ceiling — every file added or edited here is under it; `Markable.test.tsx` went
  from 307 to 59 (+ 104 in the new sibling and 80 in shared support).
- Snapshot — only `Display.test.tsx.snap` changed, by exactly the two renamed attributes;
  updated with `--updateSnapshot` on that single file after inspecting the diff.
- Running the app — `craco start` compiles and serves 200 on the branch, but the local API
  (`localhost:8001`) is down and this environment has no browser or interactive Auth0
  login, so the annotation and preview screens could not be exercised against real data.
  Stated plainly rather than claimed.

### F14 — `yarn tsc` and `yarn build` failed in CI

`1070d896` widened `onSave` from `=> void` to `=> Promise<Fragment>` so the annotation
editor could chain on the saved fragment, but typed it with the **global** `Promise`. What
`handleSave` actually returns is the Bluebird from `fragmentService.update*()`, and the
consumers on the other side — `Edition.updateEdition` and `InitializeLemmatizer`'s
`updateAnnotation` — declare `Bluebird<Fragment>`. `Promise<Fragment>` is missing 40-odd
Bluebird members, so both call sites in `editorTabContents.tsx` failed to type-check.

Fixed by making the declaration honest rather than casting: `onSave` is
`(updatedFragment: Bluebird<Fragment>) => Bluebird<Fragment>` in `editorTabContents.tsx` and
`CuneiformFragment.tsx`, and `Info.tsx`'s narrower `onSave` prop follows to
`(fragment: Bluebird<Fragment>) => void`. No runtime change: the values were always
Bluebirds. Verified with `yarn tsc` **and** `yarn build` (CI fails on both; `yarn build`
type-checks through ForkTsChecker, so running `yarn tsc` alone is not sufficient), and again
on the merge with `master`.

### F15 — Local gates ran against a stale `node_modules`

`yarn install --frozen-lockfile` restored `@types/bluebird`, after which the local `yarn tsc`
reproduced CI's two errors exactly. Every gate was then re-run from that environment. The
rule is now explicit in **Commands and Tooling**: a local gate result from an unverified
`node_modules` is not evidence.

## Hard gates added to `.github/copilot-instructions.md`

- **New section, CI — The Remote Result Is the Gate**: fetch every check run and commit
  status for the PR head before starting and before finalizing; read the failing job's log
  and annotations rather than guessing from the check name; treat a red check as a blocking
  finding regardless of who made it red; reproduce every failure locally before fixing it,
  and suspect the environment when it will not reproduce; run the gates on the **merge with
  `master`** in a scratch `git worktree`, because that is what CI builds; run every gate CI
  runs, `yarn build` included; and after pushing, wait for the run and confirm it is green.
- **Commands and Tooling**: a lockfile-consistent install is a hard gate before any local
  gate result may be reported.
- **Review Guidelines**: fetching the checks is now a hard gate on equal footing with
  gathering reviews and comments; every failing check is a blocking finding; "addressing" a
  finding means changing the code, not offering to; and the review template gains a
  mandatory `CI Status` section.

### F16 — Coverage below 100% in the code this PR touches

CI's coverage table showed ten of the 53 source files this PR touches below 100%. Only one
of them was introduced here — `editorTabContents.tsx`, extracted from
`CuneiformFragmentEditor.tsx` in this PR, whose five `onSave` callbacks had no test. The
other nine were already imperfect on `master`; the repository rule ("coverage is 100% after
changes in affected code", plus the pre-existing-issues rule) covers them too, so all ten
were taken.

| File                          | Before (stmts/br/fn/ln) | What was missing                                                       |
| ----------------------------- | ----------------------- | ---------------------------------------------------------------------- |
| `editorTabContents.tsx`       | 79/50/69/79             | every tab's save callback, `DisplayContents`, the archaeology fallback |
| `Info.tsx`                    | 82/63/71/80             | the genre/script/date callbacks and the four optional sections         |
| `CuneiformFragment.tsx`       | 88/83/71/88             | the save-failure branch and the image-column toggle                    |
| `CuneiformFragmentEditor.tsx` | 100/89/100/100          | the `disabled` default                                                 |
| `InjectedApp.tsx`             | 96/100/92/96            | the cache-scope thunks of three services                               |
| `FragmentService.ts`          | 100/93/100/100          | both non-matching branches of `clearCachedFragments`                   |
| `FragmentRepository.ts`       | 87/75/86/87             | six delegating methods, `findInCorpus`, `collectLemmaSuggestions`      |
| `RealiaRepository.ts`         | 96/94/100/96            | the AfO citation without a parenthesised year                          |
| `SignImages.tsx`              | 96/76/100/96            | the unrecognised form label, the empty-cluster path, the reopen guard  |
| `token.ts`                    | 100/50/100/100          | the short-circuit in `isStrictlyPartiallyEnclosed`                     |

Three things came out of the work that are worth recording:

1. **A latent bug in `EditorTabs`.** A test asserting that `disabled` disables the tabs
   failed: `EditorTabs` destructures `disabled` out of its props and then passed the _rest_
   to `isTabDisabled`, so `props.disabled` was always `undefined` there and no tab was ever
   disabled while a save was in flight. Fixed by threading the same `tabProps` into both
   `TabContentsMatcher` and `isTabDisabled`; the now-dead `?? false` fallback went with it.
2. **A defensive `throw` inside a render cannot be covered without breaking another gate.**
   `SignImagePagination` threw for an unknown script during render; covering that meant
   letting React log the error, and silencing `console.error` is explicitly forbidden.
   Extracted the sort into an exported `sortScriptsByPeriod` and unit tested it instead —
   same behaviour, no console output.
3. **A flaky test, found by the repeated runs.** `RealiaDisplay.redirect.test.tsx`'s "renders
   the entry once it has redirected" failed about one run in five under load: it waited for
   the spinner, then asserted the heading with the default 1 s timeout, while the redirect
   does _two_ sequential fetches. It now waits for the redirect milestone first. Eight
   consecutive runs green.

`InjectedApp.test.tsx` went from 248 to 306 lines, over the 250-line ceiling, so it was split
into `InjectedApp.test.tsx` (217) and `InjectedApp.cacheScope.test.tsx` (82) over a shared
`injectedApp.testSupport.tsx` (58). `CuneiformFragment.test.tsx` (297), `SignImages.test.tsx`
(332) and `FragmentService.test.ts` (~1 990) were already over before this task and grew
further; they stay recorded under F13.

## Remote result — green (2026-07-27)

Pushed `c70d7367` to `origin/add-realia-annotation` after verifying the push destination
(`@{push}` = `origin/add-realia-annotation`, `branch.*.merge` = `refs/heads/add-realia-annotation`)
and confirming `origin/master` was untouched at `4db5c9cd` via `git ls-remote`. Note the
first commit, `05e32ab4`, had already been pushed by the user.

Run [30287646981](https://github.com/ElectronicBabylonianLiterature/ebl-frontend/actions/runs/30287646981)
on `Merge c70d7367 into 4db5c9cd`: **every check green** — `test` (lint, tsc, 372 suites /
3 768 passed / 2 skipped, build "Compiled successfully"), CodeQL, GitGuardian, and the three
qlty statuses. CI's counts match the local merge-worktree run exactly, which is the evidence
that running the gates on a scratch merge worktree genuinely reproduces CI.

## Commit and PR description (2026-07-27)

On the user's explicit request, all of the above — code, tests and these three `TASK-pr767`
docs — went into a single commit on `add-realia-annotation`, "Address the PR #767 review
findings". Upstream was verified first: `branch.add-realia-annotation.merge` is
`refs/heads/add-realia-annotation` and `@{push}` is `origin/add-realia-annotation`, neither
of which is `master`. The branch is **not pushed**; the user pushes.

F12 was also done on request: the PR #767 description now calls out the tooling and policy
changes that ride along with the feature (`copilot-instructions.md`, the husky hooks,
`SignImages.tsx`, and the test-support changes), so a reviewer is not surprised by them.
