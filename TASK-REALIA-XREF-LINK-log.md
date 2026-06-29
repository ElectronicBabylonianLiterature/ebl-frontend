# TASK-REALIA-XREF-LINK — Work Log

## Goal

Stop Realia AfO cross-references from 404ing (`/tools/realia/Elam`). Link from
the resolved target, show the AfO volume next to inline AfO cross-references, and
render unresolvable pointers as plain text.

## Investigation

- Route: `/tools/realia/:id` in `src/router/toolsRoutes.tsx` (id decoded).
- Link sites (all in `src/realia/ui/RealiaDisplay.tsx`):
  1. `AfoEntryCrossReference` — inline AfO pointer, linked by `crossReference.id`.
  2. `AfoRegisterEntryItem` else-branch — when `crossReferences` empty, linked to
     `/tools/realia/{raw crossReference}` → **the 404 source** (`Elam`).
  3. `SeeAlsoList` — document-level merged cross-references, linked by `id`.
  4. `RealiaRedirect` — single-target redirect, linked by `target.id`.
- TS types already carry the resolved shape: `RealiaCrossReference {id, lemma}`
  (lemma equals target `_id`), `AfoRegisterEntry.afoVolume`/`page`. So no DTO or
  repository/mapping change was required.

## Changes

- `src/realia/domain/RealiaEntry.ts`
  - `realiaCrossReferenceTarget(cr)` → `cr.id || cr.lemma` (prefer stable
    realiaId, else lemma which equals the target `_id`).
  - `afoCrossReferenceCitation(afoEntry)` → `(AfO 48/49, 358)` from
    `afoVolume`/`page`; drops empty parts; `''` when both empty.
- `src/realia/ui/RealiaDisplay.tsx`
  - All four link sites build the `to` from `realiaCrossReferenceTarget`,
    URL-encoded (handles spaces/parens, e.g. `Elam (Geschichte)`).
  - `AfoEntryCrossReference` appends the AfO volume citation span.
  - The unresolved else-branch renders the raw `crossReference` as a plain
    `<span>` (no `<Link>`).
- `src/realia/ui/Realia.sass` — secondary-text styling for
  `Realia__afo-cross-reference-volume` and `Realia__afo-cross-reference-text`.

## Tests

- `src/realia/domain/RealiaEntry.test.ts` — added `realiaCrossReferenceTarget`
  and `afoCrossReferenceCitation` suites.
- `src/realia/ui/RealiaDisplay.test.tsx`
  - Replaced "links an inline AfO cross-reference by its lemma when unresolved"
    (which asserted a link from raw text — now wrong) with "links … by its lemma
    when it has no realiaId" using `crossReferences: [{ id: '', lemma: 'Elam
(Geschichte)' }]`.
  - Added "renders an unresolved inline AfO cross-reference as plain text"
    (raw `crossReference`, empty `crossReferences` → no link).
  - Added "shows the AfO volume next to an inline AfO cross-reference link".

## Gates

- `yarn lint` — PASS (one prettier wrap fixed).
- `yarn tsc` — PASS.
- Realia display + domain suites — PASS (82 tests).
- Full `yarn test --watchAll=false` — PASS: 324 suites, 3348 passed / 2 skipped,
  50 snapshots passed, zero console output.

## Follow-up: navigate by lemma + readable subsection deep-links

User correction: the route resolves entries by their `_id` (the lemma), so the
first pass's realiaId links (`/tools/realia/realia_012192`) 404'd. Expected URL
is `/tools/realia/Religion#AfO 50` and all menu subsections must be linkable and
scroll-into-view when such a URL is opened.

Decisions (confirmed with the user): all Realia links use the lemma (including
search-result links); subsection anchors become readable slugs independent of
realiaId.

- `src/realia/domain/RealiaEntry.ts` — `realiaCrossReferenceTarget` now returns
  `crossReference.lemma || crossReference.id` (lemma is the route key).
- `src/realia/ui/realiaSections.ts` — `afoVolumeId(afoVolume)` = `slugify(volume)`
  (`afo-50`); `rlaArticleId(title)` = `rla-${slugify(title)}`. Both dropped the
  realiaId argument; `buildRealiaNav` updated accordingly.
- `src/realia/ui/RealiaDisplay.tsx`
  - RlA article anchor = `rlaArticleId(entry.title)`; AfO volume anchor =
    `afoVolumeId(group.volume)` (removed realiaId threading through
    `AfoRegisterVolumes`).
  - Inline AfO cross-reference link = lemma + `#${afoVolumeId(afoEntry.afoVolume)}`.
  - Added a `useLocation` effect: on hash present, open the containing section
    (`sectionByAnchor`) and `scrollToSection(hashId)` — deep-link scroll-on-load.
- `src/realia/ui/RealiaResultsList.tsx` — search-result link uses `entry.id`
  (the lemma), not `entry.realiaId`.

### Tests (follow-up)

- `RealiaEntry.test.ts` — `realiaCrossReferenceTarget` now asserts lemma-first.
- `realiaSections.test.ts` — new anchor signatures.
- `RealiaResultsList.test.tsx` / `RealiaSearch.integration.test.tsx` (+snapshot)
  — search-result href now the encoded lemma.
- `RealiaDisplay.test.tsx` — cross-reference/redirect/See-Also links assert the
  lemma (+volume hash for inline AfO); nav + intersection tests use the new
  anchor ids; added "scrolls to the AfO volume named in the URL hash on load".

### Gates (follow-up)

- `yarn lint` — PASS (fixed a `no-node-access` by asserting via the captured
  `scrollIntoView` call instance instead of `document.getElementById`).
- `yarn tsc` — PASS.
- Realia suites — PASS (136 tests).
- Full `yarn test --watchAll=false` — PASS: 324 suites, 3349 passed / 2 skipped,
  50 snapshots passed, zero console output.

## Process note

- Reminder: remove all TASK-\*.md tracking files before merging.
