# TASK-IIIF-FE-WIRING — TODO

Wire the merged IIIF + media architecture into the fragment detail runtime flow
without changing the user's image-viewing experience and without OpenSeadragon.

## Ground truth

- [x] Confirm eBL frontend repository
- [x] Confirm branch `iiif`
- [x] Confirm no merge in progress (`.git/MERGE_HEAD` absent)
- [x] Record HEAD, status, tracked/untracked state
- [x] Read `.github/copilot-instructions.md` (no `.github/instructions/`, no CLAUDE.md, no AGENTS.md)
- [x] Read the three IIIF/media handoff docs
- [x] Inspect domain/application/infrastructure/UI modules and the isolation guard

## Implementation

- [x] Add `fragmentMediaCollectionUrl` to `infrastructure/mediaUrls.ts`
- [x] Create `infrastructure/MediaRepository.ts` (`ApiMediaRepository`)
- [x] Create `application/fragmentMedia.ts` (findManifest / findMedia / resolveMedia)
- [x] Add media ports + delegating methods to `application/fragmentServiceBase.ts`
- [x] Construct `ApiIiifRepository` + `ApiMediaRepository` in `InjectedApp.tsx`
- [x] Create `ui/images/useFragmentMediaSource.ts` hook (beta-gated, error-reporting)
- [x] Thread resolved source into `Photo.tsx` as an inert `data-media-source` hook
- [x] Wire the hook into `Images.tsx` `FragmentPhoto`
- [x] Narrow isolation-guard exemption for the composition root only

## Tests (focused only — full suite forbidden by the task)

- [x] `ApiMediaRepository` tests (14)
- [x] `fragmentMedia` application tests (27)
- [x] `useFragmentMediaSource` / `Images` integration tests (26)
- [x] Isolation guard exemption mutation coverage (+ real-tree mutation)
- [x] Viewer regression: Photo, FolioImage, ImageViewer, StaticImageViewer, ImageButtonGroup, Images
- [x] Fragment integration: factories, FragmentService, cache suites

## Gates

- [x] Every changed `.ts`/`.tsx` <= 250 lines
- [x] `yarn lint` clean
- [x] `yarn tsc` clean
- [x] Zero console output in focused runs
- [x] No commit / push / deploy / dependency change
- [x] Write `docs/IIIF_FRONTEND_RUNTIME_WIRING_HANDOFF.md`
