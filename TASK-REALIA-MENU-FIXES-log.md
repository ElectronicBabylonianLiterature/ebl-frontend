# TASK-REALIA-MENU-FIXES — Work Log

## Scope

1. Sintflut (and similar) RlA: 2 articles, only 1 shown.
2. Menu click highlight reverts to the previous item.
3. RlA references must render in their RlA article, not in "III. References".

## Investigation

- Verified the frontend renders all `reallexikon` array entries: tests with 3
  distinct ids and with 2 duplicate ids both render every article (even after
  collapse/expand re-renders). The only frontend anomaly for duplicate ids is
  React's "two children with the same key" `console.error`, which React warns
  can omit a child. Backend was unreachable from the sandbox (localhost:8001
  refused; prod 404 — `add-realia` unreleased), so the exact Sintflut JSON could
  not be inspected; fix targets the duplicate-key defect, the only frontend
  cause consistent with "only one shown".
- Bug 2 root cause: `scrollIntoView` + `scroll-margin-top: 1rem` leaves the
  previous element's bottom sliver inside the top scroll-spy band; the
  "first visible in document order" rule then re-selects that previous element
  right after the click-scroll settles.

## Changes

- `src/realia/ui/RealiaDisplay.tsx` — RlA `key` is `${entry.id}-${index}`
  (unique even when ids repeat). `navigateToSection` now calls
  `selectActiveSection(id)` so a click immediately pins the highlight.
- `src/common/hooks/useActiveSection.ts` — returns
  `{ activeId, selectActiveSection }`. `selectActiveSection(id)` sets the active
  id and sets a `performance.now()`-based lock (800 ms); the IntersectionObserver
  callback updates `visibleIds` always but skips changing `activeId` while
  locked. This keeps a clicked item active through the programmatic scroll.
- `src/realia/infrastructure/RealiaRepository.ts` — `mapRealiaEntry` collects the
  embedded RlA reference ids and filters the top-level `references` to exclude
  them, so an RlA reference is never duplicated into "III. References".

## Tests

- `RealiaDisplay.test.tsx` — "renders every RlA article even when they share an
  id"; "keeps the clicked menu item active and does not revert to the previous
  section" (clicks a section link, then drives the observer to report the
  previous section and asserts the clicked one stays active).
- `useActiveSection.test.tsx` — updated for the `{ activeId, … }` shape; added a
  lock test (programmatic select stays active while locked, resumes after, using
  a `performance.now` spy).
- `RealiaRepository.test.ts` — "keeps an RlA reference in its entry and out of
  the top-level references" (reference present in both embedded and top-level →
  ends up only in the RlA entry).

## Gates

- `yarn lint` — PASS. `yarn tsc` — PASS.
- Realia + hook suites — 117 tests PASS, console-clean; 100% coverage on
  `useActiveSection.ts`, `RealiaDisplay.tsx`, `RealiaRepository.ts`.
- Full `yarn test --watchAll=false` — see checklist (run before finalizing).

## Notes

- Not committed (per explicit instruction to wait for the user's request).
- Reminder: remove all TASK-\*.md tracking files before merging.
