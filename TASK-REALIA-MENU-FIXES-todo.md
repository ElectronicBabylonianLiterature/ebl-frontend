# TASK-REALIA-MENU-FIXES — TODO

Three Realia entry-page fixes.

1. `/tools/realia/<id>` (e.g. Sintflut) with 2 RlA articles shows only one.
2. Clicking a menu item often switches the highlight to the previous item.
3. Each RlA reference must render in its RlA article, not in "III. References".

## Checklist

- [x] Bug 1: RlA articles use a unique React `key` (`${id}-${index}`) so
      articles that share an `id` all render and the duplicate-key
      `console.error` is gone.
- [x] Bug 2: on a menu click, set the clicked id active immediately and briefly
      lock the scroll-spy so post-scroll IntersectionObserver callbacks don't
      revert the highlight to the previous (sliver) item. - `useActiveSection` now returns `{ activeId, selectActiveSection }`;
      `selectActiveSection` sets active + a short `performance.now()` lock that
      the observer callback respects. - `RealiaDisplay.navigateToSection` calls `selectActiveSection(id)`.
- [x] Todo 3: repository excludes from the top-level `references` any reference
      whose id matches an embedded RlA-entry reference (dedup), so RlA
      references live only in their article.
- [x] Tests: shared-id articles render; clicked item stays active vs scroll-spy;
      hook lock test; repo dedup test.
- [x] 100% coverage on changed files (useActiveSection.ts, RealiaDisplay.tsx,
      RealiaRepository.ts); console-clean.
- [x] `yarn lint` zero / `yarn tsc` zero.
- [ ] Full `yarn test --watchAll=false` — zero failures, zero console output.
- [ ] Remind to remove TASK-\* tracking files before merge.

## Notes / root causes

- Bug 2 root cause: after `scrollIntoView` lands the target at the top (offset by
  `scroll-margin-top: 1rem`), the previous element's bottom sliver still
  intersects the top scroll-spy band, and "first visible in document order" then
  picks that previous element. The click-lock makes the clicked selection win
  during/after the programmatic scroll.
- Bug 1: the frontend already renders all `reallexikon` array entries; the only
  frontend anomaly with two same-`id` articles is React's duplicate-key warning
  (which can omit a child). Unique keys remove the warning and guarantee both
  render. (If a page still shows one with distinct ids, that would be backend
  data — frontend renders every array entry.)
- Todo 3: references are embedded per RlA entry; if the backend also lists the
  same reference in the top-level `references`, we now filter it out by id.
