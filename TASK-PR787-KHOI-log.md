# TASK-PR787-KHOI — work log

## Candidate state

- branch `fix-n-calls`, HEAD `15bad920`
- `origin/master` `cccacb0e`, merge-base `1f5b31c8`
- Pre-existing unrelated worktree changes left untouched: `.gitignore`, `craco.config.js`,
  `.deepcode/`, `.devcontainer/devcontainer-lock.json`, `docs/`, `TASK-IIIF-*`, `PR_75*`/`PR_76*` md files.

## B1 — TypeScript gate

`yarn tsc` run at HEAD `15bad920` before any edit: **exit 0**, no diagnostics.
`src/fragmentarium/ui/text-annotation/realiaOptionLoader.ts` is byte-identical to `origin/master`
(`git diff origin/master -- <file>` empty) and already carries the precise
`toNativePromise<T>(promise: PromiseLike<T>): Promise<T>` helper that fixes the inference at its
source. The reported TS18046 does not reproduce on this checkout. No suppression added, no CI
change made. Re-verified after all edits.

## F1 — latest transliteration record

Three definitions existed. `queryItemRenderReady.hasLatestTransliterationRecord` and
`LatestTransliterationCard` both used `type === 'Transliteration' && !isHistorical`, but
`FragmentariumSearchResultComponents.TransliterationRecord` filtered on `type === 'Transliteration'`
only — so a card admitted because a non-historical record exists could display a historical one.
Added `getLatestTransliterationRecord(fragment)` in `src/query/queryItemRenderReady.ts`, defined
`hasLatestTransliterationRecord` in terms of it, and made both display sites call it.
Ordering semantics preserved: first match in `fragment.uniqueRecord` order, as before.

## F2 — malformed summary identity fields

`createQueryItem` called `museumNumberToString(dto.museumNumber)` before classification, so one
malformed item rejected `.then(createQueryResult)` and replaced the whole page with a global error.
Added `isMuseumNumber` / `toMuseumNumberString` to `fragmentarium/domain/MuseumNumber.ts` (total,
never throws), `isSummaryLineIndexes` / `isSummaryMatchCount` to `querySummaryFragment.ts`, and
`hasSummaryIdentity` to `isQuerySummaryItemDto`. `createQueryItem` now builds a total identity first,
then classifies: valid summary → `FragmentCardSummary`; summary-shaped-but-invalid **or** no usable
museum number → `UnsupportedFragmentCardSummary`; otherwise legacy. `UnavailableFragmentCard` omits
the heading link when the museum number could not be recovered, so no link is fabricated.
`ResultPages` keys now include the item index so duplicate-empty identities cannot collide.

## F3 — non-line next page

No adjacent `ebl-api` checkout exists on this machine and no repository document states the backend
guarantee, so the `hasNextPage` contract could not be verified. Took the **alternative** design from
the review: `createPagedFragmentQuery` now overfetches by one item for **every** query
(`limit = pageSize + 1`), keeping `count: 'page'` for non-line and `count: 'exact'` for line queries.
`hasNextPageAfter(items, pageSize, reportedHasNextPage)` returns
`reportedHasNextPage === true || items.length > pageSize`, so the fallback is mathematically live,
`hasNextPage` stays authoritative when present, and an absent contract can never pin a user to page 1.
The `isPageCompletenessKnown` state disappears: completeness is now always known.

## F4 — summary thumbnail

`SummaryThumbnail` used a bare `<a>` (same tab, full SPA reload). Master's `FragmentThumbnail` went
through `ThumbnailImage` → `ExternalLink` (`target="_blank" rel="noopener noreferrer"`).
`SummaryThumbnail` now reuses `ExternalLink`; the API-relative URL resolution and lazy image are kept,
and `linked={false}` still renders a bare image for Latest Additions.

## F5/F6 — Reference invariants

`setDocument` now clears `hasUnresolvedDocument` alongside `referenceId`, so a reference can no longer
report a real document and an unresolved state at once (which kept `CompactCitation` on the fallback
renderer). `hasCitationMetadata` had no production consumer and was removed; the four tests that pinned
it now assert `document.label.trim()`, which is exactly what the getter computed.

## F7/F8/F9/F11/F15

- F7: removed both prohibited comments; extracted `transportPaginationFields` in `FragmentariumSearch`.
- F8: every new `.ts`/`.tsx` file introduced by the PR now uses alias imports. No import cycles
  (`AlignmentPopover` imports `WordInfo`; `WordInfo` does not import `AlignmentPopover`).
- F9: `lineQuery` computed once and reused for `lineCountInfo`.
- F11: replaced the `try`/`catch` period fallback with an explicit `_.keyBy(Periods, 'abbreviation')`
  lookup. Behaviour preserved for full names, abbreviations, `''` → `Periods.None` and unknown →
  `Periods.Uncertain`; `'SB'` still resolves to `Uncertain` because it is a Stage, not a Period.
- F15: moved `CANONICAL_ORIGIN` into the import block in `corpus/domain/chapter.ts`, and applied the
  identical fix to `PdfExport.tsx`, which the PR broke the same way.

## F10 — Images empty tab state

`defaultKey` fell back to `CDLI` even when no CDLI nav item or pane rendered. `defaultKey`/`activeKey`
are now `string | undefined`; `undefined` is the Tab API's own "no selection" state. Invariant:
`activeKey === undefined` exactly when no nav item renders. CDLI gating, `visitedTabs` isolation and
`key={fragment.number}` reset are unchanged.

## F13 — existing test rewrites

No additional test removed, skipped or disabled. Reviewed the PR's three replacements:
`AnnotationsView.integration.test.tsx` keeps every semantic assertion of the deleted `.ts` version
(crumb list, crumb href, heading, images) and adds the Save control; the route wiring the old
`AppDriver` path exercised is now covered by `router/fragmentariumRoutes.annotate.test.tsx`.
`LatestTransliterations` and `FragmentariumSearch` replaced snapshots with explicit assertions.
No behavioural coverage loss found. Maintainer sign-off for those original snapshot removals is a
process item I cannot grant.

## F14 — project-home legacy URLs — no code change

On `origin/master` the `/projects/<abbr>` route never passed `fragmentQuery` to `HomeComponent`
(`researchProjectRoutes.tsx` lines 59-79), `fragmentQuery` is optional in `SearchFormProps`, and no
`ProjectHome` caller supplies it. `SearchForm` navigates to `/projects/<abbr>/search/`
(`SearchForm.tsx:91`), never back to the home route with criteria. Master's
`{fragmentQuery && <SearchResult .../>}` was therefore unreachable, and `/projects/<abbr>?number=...`
never rendered results on any branch. The PR's removal loses no behaviour; nothing to preserve or redirect.

## F16

No CI, Docker, devcontainer or build-config change made.

## Pre-existing issues fixed

`Images.tabs.test.tsx` emitted two `act(...)` warnings (folio/pager promises resolving after the
assertions). Fixed at the source by awaiting the resolved content instead of silencing console.

## F12 — 250-line gate

Three touched files exceed 250 lines; all three already exceeded it on `origin/master`:

| File                  | master | now | PR edit                                     | disposition                                                                                                                                                                                                              |
| --------------------- | -----: | --: | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `PdfExport.tsx`       |    775 | 776 | `CANONICAL_ORIGIN` import + use             | kept: reverting it alone would restore a hardcoded origin literal already shared with `chapter.ts`, `head.tsx`, `sitemap.tsx`, `FragmentLink.tsx` (DRY gate). +1 line on a legacy file this PR does not otherwise touch. |
| `ChapterViewLine.tsx` |    392 | 392 | import path `WordInfo` → `AlignmentPopover` | kept: zero line delta, required by the `AlignmentPopover` extraction that brought `WordInfo.tsx` under the ceiling.                                                                                                      |
| `test-corpus-text.ts` |    307 | 307 | two `.withIdentity('RN1853')` calls         | kept: zero line delta, required by the Reference identity fix.                                                                                                                                                           |

Splitting any of these would be a large refactor of legacy code unrelated to `fix-n-calls`, and wrapper
files purely to lower the count are forbidden. Every other touched `.ts`/`.tsx` is ≤ 250.
`FragmentariumSearchResultComponents.test.tsx` reached 317 while adding thumbnail coverage and was split
into `FragmentariumSearchResultComponents.thumbnail.test.tsx` (247 / 207).

## F17 — focused coverage (affected production files)

Focused run: 50 suites, 572 tests, 0 failures, 0 console output.
100% statements / functions / lines on every affected file. Remaining uncovered branches, all verified
present verbatim on `origin/master` and untouched by this PR:

- `Reference.ts:134` — `this.document?.toHtml() ?? ''`; unreachable because the constructor defaults `document`.
- `CompactCitation.tsx:10,118` — pre-existing popover-details ternaries.
- `FragmentLemmaLines.tsx:141` — pre-existing `isMatchCountTotalExact === false && 'About '`.
- `FragmentariumSearch.tsx:77` — pre-existing guest `isAllowedToReadFragments()` branch.
  `LatestTransliterationCard.tsx` reports 100/100/100/100 when covered by its own suites; the wide
  consolidated run reports 96.29% branch on it (line 31), a jest instrumentation artefact of suites that
  mock its collaborators.

## Gates

- `yarn lint` → exit 0
- `yarn tsc` → exit 0
- `git diff --check` → clean
- focused suites → 50 suites / 572 tests / 0 failures / 0 console output
- **`yarn test --watchAll=false` NOT RUN** — user instruction forbids the full suite. That repository
  hard gate remains outstanding and unverified.
