# TASK-REALIA-MENU-LINKS — TODO

Make the Realia menu section/subsection items real links that change the URL on
click, and add a second highlight that reflects solely the URL-selected item
(distinct from the existing scroll-position highlight).

## Checklist

- [x] Audit menu behaviour: nav links previously `preventDefault` + JS-only
      scroll/active; scroll highlight via `useActiveSection` (IntersectionObserver).
- [x] Clicking a section/subsection link pushes the hash to the URL
      (`useHistory` from `router/compat`; this is react-router v6).
- [x] A single `useEffect` on the URL hash opens the parent section, scrolls to
      the anchor, and seeds the scroll-active highlight (also covers deep links /
      cross-reference navigation / page load).
- [x] Second highlight: `selectedId` derived from `location.hash`, passed to the
      menu, applied as `is-selected` on the top/section/subsection link — stays
      put as the scroll-driven `is-active` moves.
- [x] SASS for `.is-selected` (inset ring + accent border), distinct from
      `.is-active` (soft background).
- [x] Tests: URL hash changes on section + subsection click; URL-selected item
      gets `is-selected` and keeps it across a scroll event. Existing 49 nav /
      scroll / highlight tests still pass (clicks now route through the URL).
- [x] Fixed a latent tsc error in the prior deep-link test
      (`scrollIntoView.mock.instances[0]` cast through `unknown`).
- [x] `yarn lint` zero / `yarn tsc` zero.
- [x] 100% coverage on affected code (`RealiaDisplay.tsx`, `RealiaNavMenu.tsx`).
      Added two tests to close pre-existing branch gaps in
      `AfoEntryCrossReference` (multi-cross-reference separator; empty-afoVolume
      → no hash/citation).
- [x] Full `yarn test --watchAll=false` — 324 suites, zero failures, zero
      console output.
- [ ] Remind to remove TASK-\* tracking files before merge.

## Follow-up: 250-line hard gate + file splits

- [x] Added a hard gate to `.github/copilot-instructions.md`: no script file
      (`.ts`/`.tsx`, incl. tests) may exceed 250 lines; split into focused
      modules.
- [x] Split the Realia-owned + shared-touched files that exceeded the limit
      (scope confirmed with user; the other ~23 over-limit files came from
      unrelated merged PRs and were left alone):
  - `RealiaDisplay.tsx` (543) → `RealiaDisplay.tsx` (210) +
    `RealiaAfoRegister.tsx`, `RealiaReallexikon.tsx`, `RealiaParts.tsx`,
    `RealiaRedirect.tsx`, `useRealiaSectionState.ts`.
  - `RealiaDisplay.test.tsx` (1195) → 6 themed test files + a shared
    `RealiaDisplay.testSupport.tsx`.
  - `RealiaEntry.test.ts` (403) → 2 files.
  - `RealiaRepository.test.ts` (358) → 2 files + shared test-data helper.
  - `router/Tools.test.tsx` (395) → 2 files + `Tools.testSupport.tsx`.
  - `router/Tools.tsx` (299) + `router/toolsRoutes.tsx` (276) → split into
    `toolsConfig.tsx`, `toolsContent.tsx`, `toolsRoutes.entities.tsx` (public
    exports preserved on the original paths).
  - `test-support/AppDriver.tsx` (267) → `AppDriver.tsx` (146) +
    `appDriverHelpers.tsx` (public API preserved).
- [x] Every changed/new script file now ≤250 lines; behaviour identical.
- [x] `yarn tsc` zero / `yarn lint` zero (fixed one prettier import wrap).
- [x] 100% coverage on all 7 Realia source modules.
- [x] Full `yarn test --watchAll=false` after splits — 332 suites (was 324; +8
      new sibling test files), 3354 passed / 2 skipped, zero failures. Test
      count unchanged → splits preserved every test. (Had to kill a stray
      `start:fast` dev server an agent left running; it was OOM-killing the
      runner.)

## Notes

- `onNavigate` simplified to `(id) => history.push({pathname, search, hash})`;
  the menu no longer needs the parent-section argument (the hash effect opens
  the parent via `sectionByAnchor`).
- `aria-current` stays on the scroll-active link to preserve existing a11y tests;
  `is-selected` is a purely visual second highlight.
