# TASK-IIIF-FE-IMPL — TODO

Branch: `iiif` | Start HEAD: `cccacb0e85443b098ffa218e203edacf71c12610`

## Ground truth

- [x] Confirm repository is eBL frontend
- [x] Confirm branch is exactly `iiif`
- [x] Record HEAD, merge-base, working tree
- [x] Inspect existing viewer/image/cache/DTO/route code
- [x] **FINDING:** media-architecture modules are ABSENT on `iiif` (branched from `master`)

## Implementation

- [x] 1. Media domain: add `media.ts` (aligned with `feature-media-architecture`) + additive IIIF extensions
- [x] 2. IIIF wire boundary (`infrastructure/iiif/`): dtos, validation, languageMap, imageService, canvasAdapter, manifestAdapter
- [x] 3. Typed Manifest result / diagnostic models
- [x] 4. Fragment IIIF discovery (DTO + domain + factory)
- [x] 5. `IiifRepository`
- [x] 6. Manifest + image-info cache (`iiifCache`, `fragmentCacheKeys`)
- [x] 7. Media source selection / compatibility precedence
- [x] 8. Shared static viewer refactor (`ImageViewer`, `StaticImageViewer`); rewire `Photo`, `FolioImage`
- [x] 9. Toolbar hardening: `noopener,noreferrer`; MIME→extension allowlist
- [x] 10. Viewer API shaped for a future OpenSeadragon renderer (no fake IIIF behavior)
- [x] 11. Isolation contract: no guard exists on this branch — record status
- [x] 12. Security rules enforced in validation
- [x] 13. Accessibility preserved

## Verification

- [x] Focused Jest runs for changed modules only (NO full suite) — 263 + 241 + 148 tests green
- [x] `yarn lint` — clean
- [x] `yarn tsc` — clean
- [x] 250-line ceiling check on every new/changed file — max 218
- [x] `docs/IIIF_FRONTEND_IMPLEMENTATION_HANDOFF.md`
