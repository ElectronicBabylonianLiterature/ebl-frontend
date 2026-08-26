# TASK-IIIF-MEDIA-MERGE — TODO

Merge local `feature-media-architecture` into the checked-out `iiif` branch while
preserving the uncommitted IIIF frontend implementation. No commit, no push, no
full test suite.

- [x] Confirm repository (`ebl-frontend`) and branch (`iiif`)
- [x] Read `.github/copilot-instructions.md`, IIIF handoffs, media architecture docs
- [x] Record ground truth (SHAs, merge-base, ahead/behind, status)
- [x] Create non-destructive safety snapshot in scratch
- [x] Untracked-path collision detection
- [x] Modified tracked-path collision detection
- [x] Perform `git merge --no-commit --no-ff feature-media-architecture`
- [x] Reconcile `media.ts` (expect byte-identical)
- [x] Reconcile media mappers vs IIIF adapters (separate validators)
- [x] Reconcile source precedence (iiif → media-endpoint → legacy-photo → none)
- [x] Reconcile `MediaRepository` vs `IiifRepository`
- [x] Reconcile caches (`FragmentCache`, `ScopedCache`, `IiifCache`)
- [ ] Reconcile media architecture isolation guard
- [x] Verify viewer refactor preserved
- [x] Verify security boundaries preserved
- [x] Focused tests (media, IIIF, viewer, fragment integration)
- [x] `yarn lint`
- [x] `yarn tsc`
- [x] Final merge-state inspection
- [x] Write `docs/IIIF_FRONTEND_MEDIA_MERGE_HANDOFF.md`
