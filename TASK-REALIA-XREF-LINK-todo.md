# TASK-REALIA-XREF-LINK — TODO

Link Realia AfO cross-references to the resolved target, show the AfO volume,
and render unresolvable pointers as plain text (fixes `/tools/realia/Elam` 404).

## Checklist

- [x] Audit every realia link site: inline AfO `crossReferences` pointer,
      raw-`crossReference` fallback, `SeeAlsoList`, `RealiaRedirect`. Route is
      `/tools/realia/:id` (decoded in `toolsRoutes`).
- [x] Confirm TS types already carry the new shape (`RealiaCrossReference {id,
    lemma}`, `AfoRegisterEntry.afoVolume/page`); no DTO/mapping change needed.
- [x] Domain: add `realiaCrossReferenceTarget` (id || lemma) and
      `afoCrossReferenceCitation` (`(AfO 48/49, 358)`).
- [x] Build all cross-reference links from the resolved target via
      `realiaCrossReferenceTarget`, URL-encoded (handles `Elam (Geschichte)`).
- [x] Inline AfO cross-reference: render the AfO volume after the link.
- [x] Unresolved inline pointer (raw `crossReference`, empty `crossReferences`)
      → plain text, no link. Stop building links from raw text.
- [x] Apply id-or-lemma resolution to `afoCrossReferences` / `crossReferences`
      (See Also) and the redirect pointer.
- [x] Tests: replace the obsolete "links by lemma when unresolved" test; add
      plain-text + AfO-volume + lemma-fallback tests; domain helper tests.
- [x] `yarn lint` zero / `yarn tsc` zero.
- [x] Full `yarn test --watchAll=false` — 324 suites, zero failures, zero
      console output.
- [ ] Remind to remove TASK-\* tracking files before merge.

## Follow-up (user correction): navigate by lemma + subsection deep-linking

The first pass linked by `realiaId`, but the route resolves entries by the
lemma (`_id`); `realia_012192` 404s while `Religion` works.

- [x] `realiaCrossReferenceTarget` returns the **lemma** (route key), not the id.
- [x] All Realia links use the lemma, incl. **search-result** links
      (`RealiaResultsList` now uses `entry.id`, not `entry.realiaId`).
- [x] Readable, realiaId-independent subsection anchors: `afoVolumeId(volume)` =
      `slugify(volume)` (`afo-50`); `rlaArticleId(title)` = `rla-<slug>`.
- [x] Inline AfO cross-reference links carry the target AfO-volume hash:
      `/tools/realia/Religion#afo-50`.
- [x] Deep-link scroll-on-load: `RealiaDisplay` reads `location.hash`, opens the
      containing section, and scrolls to the anchor.
- [x] Updated nav/intersection/sections/results/integration tests + snapshot;
      added a deep-link scroll test and a lemma-encoding test.
- [x] `yarn lint` zero / `yarn tsc` zero.
- [x] Full `yarn test --watchAll=false` — 324 suites, zero failures, zero
      console output.

## Notes

- The 404 came from the `else` branch in `AfoRegisterEntryItem` that linked to
  `/tools/realia/{raw crossReference}` (e.g. `Elam`), which is not a page id.
- AfO volume for the inline pointer comes from the containing afo entry
  (`afoVolume`/`page`), which already exist on `AfoRegisterEntry`.
- Data side is frozen; no data-prep changes.
