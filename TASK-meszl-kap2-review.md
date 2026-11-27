# TASK meszl-kap2: review of PR #872 (ebl-frontend)

## Summary

An independent, deliberately harsh review was run on the branch
`ccr-d085af16-bshs1r` against `origin/master`, together with all existing
GitHub feedback on PR #872. The branch built, type-checked and passed its
tests, but the review found the following:

- broken collapse controls;
- MesZL text garbled by Markdown;
- imprecise cross-reference links;
- full page reloads on reference clicks;
- no loading or error state for Kapitel II;
- tabs without keyboard support;
- several smaller defects.

qlty flagged duplication between the new shared entry-page code and Realia.
Every finding below has been fixed in code, with tests.

## Comment status tracking

| Source | Thread | Status |
| --- | --- | --- |
| qlty (review COMMENTED) | identical code, `EntryNavMenu.tsx:48` | resolved in code (shared `EntryNavList`), thread not yet marked resolved on GitHub |
| qlty | similar code, `EntryNavMenu.tsx:82` | resolved in code, thread open |
| qlty | similar code, `EntryNavMenu.tsx:162` | resolved in code, thread open |
| qlty | similar code, `useEntrySectionState.ts:28` | resolved in code: Realia imports the shared hook (its own hook file is deleted), thread open |
| qlty | boolean logic, `MesZlText.tsx:11` (`isPlainLeftClick`) | resolved in code in round 2 (modifier keys checked with `some`), thread open until qlty re-runs |
| Human reviews / issue comments | none | — |

## Findings

| # | Finding | Severity | Status |
| --- | --- | --- | --- |
| 1 | Nav "Collapse/Expand" toggles did nothing (sections were non-collapsible) | High | Fixed. Sections are collapsible and open by default. MesZL is not collapsible and shows no toggle (optional `collapsible` flag on `EntryNavSection`). |
| 2 | Markdown block syntax at line start (tabs → code block, `1.`, `-`, `#`, `>`) garbled MesZL lines | High | Fixed. Markers are escaped and indentation is kept as tab spans. |
| 3 | Reference linking: `(n12)` missed, `AN n5` missed, `n1 und 2 Zeichen` over-linked, ranges half-linked, dead `p` entry | Medium | Fixed. The list-item rule now applies only at line start. The publication list is built from the data. A follow-on number is not linked when a counted noun follows. Ranges are linked. |
| 4 | Reference links and the overview MesZL link reloaded the whole app | Medium | Fixed. Plain left clicks go through `history.push`; modified clicks are left to the browser. The overview link uses `navigateToSection` and appears only when the section exists. |
| 5 | Kapitel II: errors swallowed, no loading state, nav section listed even when empty | Medium | Fixed. `useMesZlKap2` returns unavailable/loading/error/loaded states. A spinner or alert is shown, and the nav includes MesZL only when there is something to show. |
| 6 | Tabs lacked roving tabindex and arrow keys | Medium | Fixed. React-bootstrap `Tab.Container`/`Nav` handles them (tested). |
| 7 | Cuneiform regex spanned line breaks | Medium | Fixed. Only spaces, tabs and no-break spaces join signs. |
| 8 | First paragraph lost its `<p>` (`removeParagraphHtmlTag`) | Low | Fixed. The paragraphs are rendered inside one HTML block. |
| 9 | Fossey row limit never grew after a narrow → wide resize | Medium | Fixed. The limit is computed from the grid's column count and tested with a resize. |
| 10 | Deep links scrolled before async content settled | Low | Fixed in the sign page (`useKeepSectionInView`). The target stays in view while the page grows, until the reader acts. |
| 11 | Sign page stylesheet leaked into search; `@font-face` imported twice | Low | Fixed. Added `MesZl.sass` and `_borger-fonts.sass`; the CSS `@import` is replaced by a JS import. `CuneiformConverterForm` now imports the fonts explicitly. |
| 12 | `public/fonts/BorgerAkkadian.ttc` (1.48 MB) committed | Info | Kept on purpose. The user wants the download and holds the permission. Hosting it elsewhere is an option for later. |
| 13 | Test gaps: Kap. II error, abort, keyboard, nav toggles, stale test name, layout-mock Fossey test | Medium | Fixed. Tests were added or rewritten, and the stale test was renamed. |
| N | Nits: unused `wordService`, duplicated `mesZlNumber` (first MZL only), half-applied `shown`, untyped labels, index keys, repeated `splitWordId`, data-URI space, useless `key`, optional chaining on a required string | Low | Fixed. `Sign.mesZlNumbers` shows every MZL number. |
| Q | qlty duplication between `common/ui/entry-page` and `realia/ui` | Medium | Fixed. Shared `EntryNavList` and section-state hook; Realia tests are unchanged and green. |
| C | `OTHER_CATALOGUES` held spellings absent from the data | Low | Fixed. Removed `EmesalStudien` and `p` (no occurrences). Removed `HethZI`, `LTNT`, `LTTB`, `NLKD` and `RÈC`: the data import now corrects these typos in Borger's text. |

Naming: `MesZL` is kept in UI text and the existing `MesZLContent` file name.
`MesZl` is used in identifiers and `meszl` in ids and scopes, matching
existing eBL usage (`mesZl` field, `MZL` list). The scope string
`read:meszl-kap2` matches the API and Auth0.

## Second review (merciless), round 2

| # | Finding | Severity | Status |
| --- | --- | --- | --- |
| R1 | Collapsed sections reopened and focus jumped when Kapitel II finished loading | Major | Fixed. Sections are built from stable booleans (MesZL present, composites present). `useEntrySectionState` merges new ids into the existing state. The hash effect runs once per location, or again only while its target is not yet a known section. Tests fail on the old code. |
| R2 | Escaping incomplete: literal `<`, `>`, `&` | Major | Fixed. The data shows real HTML only as `span`, `u` and `br`. Every other `<…>` is an Assyriological bracket (`<<IGI>>`, `<A>`, `<AN>`, `<ki>`, `<...>`, `< ba₇`), which DOMPurify used to delete. These and `&` are now escaped. `*`, `**` and `^` stay markup, as intended by Borger. `_` (2 unpaired `$_`) and backticks (none) need no escaping. Leading spaces stay as indentation. Tests use real examples. |
| R3 | Realia still duplicated the navigation logic and Sass | Minor | Fixed. Realia uses `useEntryPageNavigation`, `EntryNavMenu` (with the mobile "On this page" toggle moved there), `EntrySection` and `EntryMetadata`, as on `sumerian-dictionary-frontend`. `_realia-layout.sass` and `_realia-link-pill.sass` are deleted; the shared layout is master's Realia grid under `EntryPage__` names. `RealiaNavMenu.tsx` is deleted and the code comment removed. Realia tests are green with updated class selectors. |
| R4 | Logogram information dropped | Minor | Fixed. Unparsed Schramm text is rendered as is, logograms without a word are listed under "Without dictionary word", and guide words and the unattested `*` are fetched again with one `findAll` request. |
| R5 | Reference edge cases | Minor | Fixed. `[n5]`, `“n5”`, `n5;n6` and leading zeros (`n05`) are handled, with tests. The follow-on rule before a capitalised word is kept: the data has no counter-example, and it prevents counted nouns from being linked. |
| R6 | Click handler ignored origin | Minor | Fixed, tested. |
| R7 | Kapitel II fetched for signs without MZL numbers | Minor | Fixed, tested. |
| R8 | `EntryMetadata` unused | Minor | Now used by `RealiaMetadata`, exactly as on the Sumerian branch. |
| R9 | Duplicate escaping in `MesZLContent` | Minor | Fixed. It uses the shared `escapeMesZlText`. |
| R10 | `aria-controls` missing; no mobile nav toggle on the sign page | Minor | Fixed. Toggles point at the section content and sub-list ids, and the shared nav has the mobile toggle. |
| R11 | Kapitel III remounted when Kapitel II arrived | Minor | Fixed. The tab shell is shown while Kapitel II loads, with a spinner or error in its pane. Tested. |
| R12 | Task files and review file inaccurate | Minor | Fixed. These files are committed, because a stop hook requires a clean tree, and must be removed before merging. |
| Nits | Empty composites in nav, `isPlainLeftClick`, `useKeepSectionInView` location and scroll race, Fossey key, hidden Fossey images decoded | — | All fixed. Composites are hidden when empty (Palaeography kept), the hook moved to `common/ui/entry-page` and skips its initial observation, the Fossey key includes the page, and hidden cards are not rendered. The TTC is kept. |

Extra requests handled in this round:

- **Sign search:** the MesZL number is converted from `'`, `’` and `ʹ` to `′` when the list query is submitted (MesZL only). The same applies to every MesZL search link.
- **Sign search results:** each result shows the sign page's overview card (glyph in Borger Akkadian White Heads, falling back to Assurbanipal; sign name; `MesZL … · U+…`). The card is one shared component, `signs/ui/SignCard.tsx`, with a `compact` variant whose name links to the sign page. The rest of each row (readings, MesZL popover, period rows) is unchanged, and so are `.Neo-Assyrian` and `.Neo-Babylonian`.

## Reproduction Steps

1. `git fetch origin && git checkout ccr-d085af16-bshs1r`
2. `yarn lint && yarn tsc && yarn test:ci`
3. Open `/signs/ŠE` as a reader and as a user with `read:meszl-kap2`.
4. On the page, check that:
   - the nav collapses Logograms;
   - MesZL has no toggle;
   - the Kap. Ⅱ tab works with the arrow keys;
   - n-links navigate without a reload;
   - `#sign-fossey` stays in view while images load.

## Recommendation

Approve after CI and qlty are green on the pushed commit. Before merging:

- mark the four qlty threads resolved;
- mirror the shared entry-page changes on `sumerian-dictionary-frontend`:
  - `EntryNavList.tsx`, new;
  - `EntryNavMenu.tsx`;
  - `entryNavSections.ts`: optional `collapsible`;
  - `useEntrySectionState.ts`: focus in `scrollToSection`, merged open state;
  - `useEntryPageNavigation.ts`: one hash scroll per location;
  - `EntrySection.tsx` and `EntryNavList.tsx`: `aria-controls` and content ids;
  - `_entry-page-layout.sass`: grid layout and mobile toggle;
  - `useKeepSectionInView.ts`, new.

## What Has To Be Done

1. Push the fix commit and confirm CI (`yarn test:ci`) and qlty on PR #872 are green.
2. Resolve the four qlty review threads on GitHub once qlty re-runs clean.
3. Mirror the shared `src/common/ui/entry-page` changes on `sumerian-dictionary-frontend` (listed above).
4. Run the data scripts after deploying; they correct the catalogue typos that the link list no longer accepts.
5. Request a human review; no human reviewer has commented yet.
6. Remove `TASK-meszl-kap2-todo.md`, `TASK-meszl-kap2-log.md` and this file before merging. They are committed on the branch.
7. The shared entry-page files differ from `sumerian-dictionary-frontend`, and Realia there is older than master. Expect conflicts in Realia and keep master's features (eBL realia, reference types).
