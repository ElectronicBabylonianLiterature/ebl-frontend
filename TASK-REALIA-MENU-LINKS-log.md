# TASK-REALIA-MENU-LINKS — Work Log

## Goal

Turn the Realia "On this page" menu items into real links that update the URL on
click, and add a second highlight that reflects solely the URL-selected
section/subsection — separate from the existing scroll-position highlight.

## Investigation

- `RealiaNavMenu` links used `event.preventDefault()` + `onNavigate(id,
sectionId)`, which scrolled and set active state in JS but never touched the
  URL.
- Highlighting came from `useActiveSection` (IntersectionObserver) → `activeId`
  → `is-active` (+ `aria-current`), with an 800 ms lock after a programmatic
  selection.
- The project is on react-router v6; `useHistory` is provided by the
  `router/compat` shim (a first attempt importing it from `react-router-dom`
  crashed into the error boundary — v6 has no `useHistory`).

## Changes

- `src/realia/ui/RealiaDisplay.tsx`
  - `useHistory` (compat) + `useLocation`; `selectedId` derived from
    `location.hash`.
  - The hash effect now drives everything: open the parent section
    (`sectionByAnchor`), `selectActiveSection`, `scrollToSection`. Keyed on the
    `location` object so a click (or re-click) re-runs it.
  - `navigateToSection(id)` pushes `{pathname, search, hash: '#'+id}` — the click
    changes the URL; the effect reacts.
  - Pass `selectedId` to `RealiaNavMenu`.
- `src/realia/ui/RealiaNavMenu.tsx`
  - `onNavigate` simplified to `(id) => void`; added `selectedId` prop; top,
    section and subsection links get `is-selected` when `selectedId` matches.
- `src/realia/ui/Realia.sass` — `.is-selected` for `.Realia__nav-top` and
  `.Realia__nav-link, .Realia__nav-sublink`: inset 1px ring + accent left
  border, distinct from `.is-active` (soft background fill).

## Tests

- `src/realia/ui/RealiaDisplay.test.tsx`
  - Added a `LocationHashProbe` + `renderDisplayWithLocation` helper.
  - "changes the URL hash when a section link is clicked".
  - "changes the URL hash when a subsection link is clicked".
  - "marks the URL-selected subsection with a second highlight that survives
    scrolling" (loads with a hash → `is-selected` on the target; a scroll
    intersection elsewhere leaves `is-selected` in place; the non-selected RlA
    link never gets it).
  - All 49 pre-existing nav/scroll/highlight tests still pass with clicks now
    routed through the URL.
- Fixed a latent tsc error introduced in the prior task's deep-link test
  (`scrollIntoView.mock.instances[0]` → cast through `unknown`).

## Coverage (gate I initially skipped)

`--coverage` on the affected files first reported `RealiaDisplay.tsx` branches at
96.55% (uncovered 159-167 in `AfoEntryCrossReference`, a pre-existing gap from
the prior XREF task). Added two tests:

- "links several resolved cross-references in one AfO entry" — the `index > 0`
  separator branch.
- "links an inline cross-reference without a hash when the entry has no AfO
  volume" — the empty-`afoVolume` (no `#hash`) and empty-`citation` branches.

Both `RealiaDisplay.tsx` and `RealiaNavMenu.tsx` are now 100% stmts/branch/
funcs/lines.

## Gates

- `yarn lint` — PASS (fixed prettier wrapping).
- `yarn tsc` — PASS.
- 100% coverage on `RealiaDisplay.tsx` and `RealiaNavMenu.tsx`.
- Realia suites — PASS (141 tests).
- Full `yarn test --watchAll=false` — PASS: 324 suites, 3352 passed / 2 skipped,
  50 snapshots passed, zero console output (re-run below after the coverage
  tests).

## Follow-up: 250-line hard gate + file splits

Added a hard gate to `.github/copilot-instructions.md`: no script file
(`.ts`/`.tsx`, incl. tests) may exceed 250 lines. Verified the gate was not
previously present (no `250`/`max-lines` in instructions or eslint config).

Scope confirmed with the user: split the Realia-owned + shared-touched files
that exceeded the limit. The other ~23 over-limit files in the branch came from
unrelated PRs merged into `add-realia` (folios, fragmentarium, corpus, dossiers,
About, etc.) and were intentionally left alone.

Splits (behaviour identical; public APIs preserved on original paths):

- `RealiaDisplay.tsx` 543 → 210, extracting `RealiaAfoRegister.tsx`,
  `RealiaReallexikon.tsx`, `RealiaParts.tsx` (metadata/section/see-also),
  `RealiaRedirect.tsx`, `useRealiaSectionState.ts` (hook + `scrollToSection`).
- `RealiaDisplay.test.tsx` 1195 → 6 themed test files + `RealiaDisplay.testSupport.tsx`.
- `RealiaEntry.test.ts` 403 → 2 files.
- `RealiaRepository.test.ts` 358 → 2 files + `realiaRepositoryTestData.ts`.
- `router/Tools.test.tsx` 395 → 2 files + `Tools.testSupport.tsx`.
- `router/Tools.tsx` 299 + `router/toolsRoutes.tsx` 276 → +`toolsConfig.tsx`,
  `toolsContent.tsx`, `toolsRoutes.entities.tsx`.
- `test-support/AppDriver.tsx` 267 → 146 + `appDriverHelpers.tsx`.

The six file splits were delegated to parallel subagents over disjoint files;
all gates were run centrally afterward.

### Gates (after splits)

- Every changed/new script file ≤250 lines (verified by `wc -l`).
- `yarn tsc` — PASS.
- `yarn lint` — PASS (fixed one prettier import wrap in `toolsRoutes.tsx`).
- 100% coverage on all 7 Realia source modules.
- Full `yarn test --watchAll=false` — PASS: 332 suites (was 324; +8 sibling test
  files), 3354 passed / 2 skipped, 50 snapshots, zero failures. Test count
  unchanged → no test lost. (A stray `start:fast` dev server left by an agent
  was OOM-killing the runner; killed it, then the suite completed.)

## Process note

- Reminder: remove all TASK-\*.md tracking files before merging.
