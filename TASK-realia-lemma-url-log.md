# TASK-realia-lemma-url — Work Log

## Problem

Alt-clicking a realia annotation indicator opened `/tools/realia/realia_001514` (the realia id) instead
of `/tools/realia/Babylon` (the lemma).

## Investigation

- `SpanIndicator` / `SpanIndicatorView` called `openRealiaPageInNewTab(realiaId)` →
  `getRealiaPageUrl(realiaId)` → `/tools/realia/<realiaId>`.
- Every other realia link already uses the lemma: `RealiaResultsList` (`entry.id`), `RealiaParts`,
  `RealiaAfoRegister`, `RealiaRedirect`. For a `RealiaEntry`, `id` is the lemma and `realiaId` is
  `realia_XXXX`.
- Route `/tools/realia/:id` → `RealiaDisplay` → `RealiaService.find(id)`, which dispatches on `isRealiaId`
  (`/^realia_\d+$/`): a lemma → `RealiaRepository.find(lemma)`; a realia id → `findByRealiaId`. So the page
  already resolves both, and the lemma is the app-wide convention.
- The lemma is available in `useSpanIndicator` as the computed `label` (`getSpanLabel` →
  `getRealiaLabel(lookup, realiaId)` → the lemma, or the realia id when the lemma is not in the lookup).

## Change

- `useSpanIndicator.ts`: added `label: string` to `SpanIndicatorPresentation` and returned it.
- `SpanIndicator.tsx` / `SpanIndicatorView.tsx`: open the realia page with `label` (the lemma). The
  gate stays `realiaId && isRealiaPageShortcut(event)` — realia only, alt+left-click only. When the lemma
  is unresolved, `label` is the realia id, which is still a valid route param (graceful fallback).
- `realiaPage.ts`: renamed the param `realiaId` → `identifier` for accuracy (it now takes a lemma or id).
- Tests: `SpanIndicator.test.tsx` and `SpanIndicatorView.test.tsx` now assert `/tools/realia/Apkallu`
  (the lemma); added a `SpanIndicator` test that an unresolved lemma opens `/tools/realia/realia_404`.

## Gate results

(recorded below)
