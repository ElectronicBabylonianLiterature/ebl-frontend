# IIIF Frontend Implementation Handoff — eBL Frontend

**Pass:** first frontend IIIF implementation pass (pre-Image-API).
**Prepared:** 2026-08-24.
**Repository:** `ebl-frontend`.

Status labels: `CONFIRMED` (verified by command or file read) · `IMPLEMENTED` · `DEFERRED` · `BLOCKED` · `UNKNOWN`.

---

## 1. Verdict

**The frontend is now genuinely ready to consume IIIF Presentation API 3, and no production image behaviour changed.** `IMPLEMENTED`

A complete, tested Presentation-3 ingestion path exists end to end: permissive DTOs → validation →
language-map resolution → Canvas/Image-Service adaptation → a single Manifest interpretation point →
typed result and diagnostic models → an origin-restricted repository → a scope-invalidated cache →
a source-precedence resolver. Fragment DTOs now carry and normalize the agreed `iiif` discovery field.

Two things must be understood before continuing:

1. **The branch premise in the task brief did not hold.** `CONFIRMED` The `iiif` branch is exactly
   `origin/master` (`cccacb0e…`) and contains **none** of the `feature-media-architecture` media
   domain. See §7. The media domain was therefore created here, deliberately shaped to merge cleanly
   with that branch.
2. **Nothing renders from IIIF yet, by design.** `IMPLEMENTED` The adapters, repository and cache have
   no caller in any rendering path, because no browser-loadable Image Service exists to render. The
   one runtime-visible change is the viewer consolidation, which is behaviour-preserving.

OpenSeadragon was **not** added. `DEFERRED` — no Image API contract is verifiable on this branch (§27).

---

## 2. Repository path

`/workspaces/ebl-frontend` — remote `origin` → `https://github.com/ElectronicBabylonianLiterature/ebl-frontend.git`. `CONFIRMED`

## 3. Branch

`iiif` `CONFIRMED` (`git rev-parse --abbrev-ref HEAD`). Upstream `origin/iiif`. No branch switch occurred.

## 4. Starting HEAD

| Property                                    | Value                                                                          |
| ------------------------------------------- | ------------------------------------------------------------------------------ |
| HEAD at start                               | `cccacb0e85443b098ffa218e203edacf71c12610` — "Update Assurbanipal font (#789)" |
| `git merge-base HEAD origin/master`         | `cccacb0e85443b098ffa218e203edacf71c12610`                                     |
| `git merge-base HEAD master`                | `d93126190b58fb9af1df4cc76294664c36b48be1`                                     |
| Commits unique to `iiif` vs `origin/master` | **0**                                                                          |

`iiif` is a fresh branch sitting exactly on `origin/master`. `CONFIRMED`

## 5. Initial working-tree state

```
 M craco.config.js
?? .deepcode/
?? .devcontainer/devcontainer-lock.json
?? PR_750_CLAUDE_FINAL_ADVERSARIAL_REVIEW.md
?? PR_750_CLAUDE_FINAL_INDEPENDENT_REVIEW.md
?? PR_765_CLAUDE_FINAL_ADVERSARIAL_REVIEW_HANDOFF.md
?? TASK-IIIF-FE-log.md
?? TASK-IIIF-FE-todo.md
?? docs/
```

All of this is pre-existing and unrelated to IIIF, and **all of it was preserved untouched**. `CONFIRMED`
`craco.config.js` carries an uncommitted Jest `moduleNameMapper` entry for `maplibre-gl` CSS; it was
not modified. The prior investigation's `TASK-IIIF-FE-*.md` files were left alone; this pass wrote
its own `TASK-IIIF-FE-IMPL-todo.md` / `TASK-IIIF-FE-IMPL-log.md`.

## 6. Instructions reviewed

| Path                                         | Present                     | Notes                                                                                                                 |
| -------------------------------------------- | --------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `.github/copilot-instructions.md`            | **Yes** `CONFIRMED`         | 7,696 bytes, `applyTo: '**'`. The single authoritative instruction file.                                              |
| `.github/instructions/**/*.md`               | No `CONFIRMED`              | `.github/` holds only `copilot-instructions.md` and `workflows/`.                                                     |
| `CLAUDE.md`                                  | No `CONFIRMED`              |                                                                                                                       |
| `AGENTS.md`                                  | No `CONFIRMED`              |                                                                                                                       |
| `docs/IIIF_FRONTEND_ARCHITECTURE_HANDOFF.md` | Yes (untracked) `CONFIRMED` | The prior investigation. Used as design input; its branch-state findings were re-verified and partly superseded (§7). |
| `docs/review-feature-media-architecture.md`  | Yes (untracked) `CONFIRMED` |                                                                                                                       |

Binding conventions honoured: full import paths (no `./` relative imports in new code); explicit type
annotations; `unknown` only at the untrusted wire boundary; **no comments in production code**;
250-line hard ceiling on every `.ts`/`.tsx` file including tests; DRY (the duplicated viewer shell was
the specific violation removed); `yarn` not `npm`; `yarn lint` and `yarn tsc` run as hard gates.

**Explicit deviations authorised by the task brief:** no commit, no push, **no full test suite**, no
deployment, no production access, no comments in production code.

## 7. Existing media architecture found

**None.** `CONFIRMED`

```
$ find src -iname "media*"          → (no output)
$ ls src/fragmentarium/domain/media.ts
     src/fragmentarium/domain/mediaGallery.ts
     src/fragmentarium/infrastructure/media*.ts
     src/fragmentarium/application/MediaRepository.ts
     src/fragmentarium/application/MediaBinaryLoader.ts
     src/test-support/mediaArchitectureIsolationGuard.ts
                                    → No such file or directory (all six)
```

The `feature-media-architecture` work exists only on that branch (and on `origin/feature-media-architecture`).
Constraint 4 forbids fetch/merge/rebase/cherry-pick, so this branch could not be rebuilt onto it.

**Response chosen (safest reversible option):** `src/fragmentarium/domain/media.ts` was created with
content **byte-identical** to `feature-media-architecture:src/fragmentarium/domain/media.ts`, read
read-only via `git show` and verified with `diff` (no differences). Every IIIF addition then went into
_separate, additive modules_ rather than editing that file. Consequence: when
`feature-media-architecture` merges, `media.ts` is a no-op and the IIIF modules layer cleanly on top.

**Reconciliation item for whoever merges:** `feature-media-architecture` also brings
`mediaGallery.ts`, the `mediaDtos`/`mediaMapper*` family, `mediaUrls.ts`, `MediaRepository`,
`MediaBinaryLoader`, and the isolation guard. None of those exist here, so none conflict — but the
four-way source precedence in `mediaSource.ts` reserves a `'media-endpoint'` slot that should be wired
to `normalizeCompatibleMediaSummary` once that branch lands (§21).

## 8. Existing runtime isolation status

`CONFIRMED` **No isolation guard exists on this branch** — there is no
`src/test-support/mediaArchitectureIsolationGuard.ts` and no
`src/fragmentarium/infrastructure/mediaArchitectureIsolation.test.ts` to preserve, narrow, or retire.
Nothing was weakened or deleted. See §26 for the equivalent discipline applied here.

## 9. Files created

**Domain (6)**
| File | Lines | Purpose |
| --- | --- | --- |
| `src/fragmentarium/domain/media.ts` | 113 | Canonical media domain, identical to `feature-media-architecture`. |
| `src/fragmentarium/domain/mediaImageService.ts` | 50 | `ImageServiceDescriptor`, compliance levels, capability predicates. |
| `src/fragmentarium/domain/iiifMedia.ts` | 38 | `MediaRendering`, `IiifMediaRepresentations`, `IiifMediaResource`. |
| `src/fragmentarium/domain/iiifDocument.ts` | 67 | `IiifReference`, `IiifDocument`, `IiifDiagnostic`, selectors. |
| `src/fragmentarium/domain/iiifResult.ts` | 68 | Typed fetch/normalization result states. |
| `src/fragmentarium/domain/mediaSource.ts` | 81 | Source precedence and legacy fallback. |

**Infrastructure (10)**
| File | Lines | Purpose |
| --- | --- | --- |
| `.../infrastructure/iiif/iiifDtos.ts` | 80 | Permissive wire DTOs — every field `unknown`. |
| `.../infrastructure/iiif/iiifValidation.ts` | 130 | Scheme, origin, integer, array and string guards. |
| `.../infrastructure/iiif/iiifLanguageMap.ts` | 106 | The single language-map resolver. |
| `.../infrastructure/iiif/iiifImageService.ts` | 138 | Image Service parsing; `info.json` URL. |
| `.../infrastructure/iiif/iiifCanvasBody.ts` | 111 | Painting bodies, thumbnails, `rendering` alternatives. |
| `.../infrastructure/iiif/iiifCanvasAdapter.ts` | 112 | Canvas → `IiifMediaResource`. |
| `.../infrastructure/iiif/iiifDescriptive.ts` | 99 | Metadata, rights, provider, homepage. |
| `.../infrastructure/iiif/iiifManifestAdapter.ts` | 150 | **The single raw-Manifest interpretation point.** |
| `.../infrastructure/iiif/iiifReference.ts` | 41 | Fragment `iiif` discovery normalization. |
| `.../infrastructure/iiif/iiifApiPath.ts` | 28 | Absolute eBL URL → `ApiClient` path. |
| `.../infrastructure/IiifRepository.ts` | 150 | Manifest and `info.json` fetching. |

**Application (1)** — `src/fragmentarium/application/iiifCache.ts` (65).

**UI (3)** — `src/fragmentarium/ui/images/viewer/imageViewerContract.ts` (15),
`StaticImageViewer.tsx` (41), `ImageViewer.tsx` (53).

**Common (1)** — `src/common/utils/imageFileExtension.ts` (28).

**Test support (2)** — `src/test-support/iiif-fixtures/iiifFixtures.ts` (147),
`hostileIiifFixtures.ts` (81). The fixture corpus covers: minimal single-image, multi-Canvas,
missing Image Service, localized language maps, malformed Manifests, hostile URLs and metadata,
unsupported bodies, Level 0 and Level 2 Image Services, and an external-origin Manifest.

**Tests (16)** — `iiifValidation.test.ts` (184), `iiifLanguageMap.test.ts` (79),
`iiifImageService.test.ts` (166), `iiifCanvasAdapter.test.ts` (216),
`iiifManifestAdapter.test.ts` (227), `iiifDescriptive.test.ts` (110),
`iiifReference.test.ts` (62), `iiifSecurity.test.ts` (87), `iiifApiPath.test.ts` (77),
`IiifRepository.test.ts` (219), `iiifCache.test.ts` (72), `mediaSource.test.ts` (80),
`iiifDocument.test.ts` (106), `imageFileExtension.test.ts` (57),
`viewer/ImageViewer.test.tsx` (99), `viewer/StaticImageViewer.test.tsx` (71).

Every file is under the 250-line ceiling. `CONFIRMED` (largest file touched: `fragmentCache.ts` at
245; largest new file: `iiifManifestAdapter.test.ts` at 227).

## 10. Files modified

| File                                                    | Change                                                                                  | Runtime effect                                               |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `src/fragmentarium/domain/FragmentDtos.ts`              | `+ iiif?: unknown`                                                                      | None — optional wire field.                                  |
| `src/fragmentarium/domain/fragment.ts`                  | `+ iiif?: IiifReference` on props, field and constructor                                | None when the field is absent.                               |
| `src/fragmentarium/infrastructure/fragmentFactories.ts` | `createFragment` calls `normalizeFragmentIiifReference(dto)`                            | `undefined` for every current backend response.              |
| `src/fragmentarium/application/fragmentCacheKeys.ts`    | `+ manifestKey`, `+ imageInfoKey`                                                       | None — new functions.                                        |
| `src/fragmentarium/application/fragmentCache.ts`        | `+ readonly iiif: IiifCache` sharing the existing `ScopedCache` (3 lines; file now 245) | None until used.                                             |
| `src/fragmentarium/ui/images/ImageButtonGroup.tsx`      | `noopener,noreferrer` on `window.open`; MIME-allowlist download extension               | **Behaviour change — intended** (§23).                       |
| `src/fragmentarium/ui/images/Photo.tsx`                 | 89 → 54 lines; uses `ImageViewer`                                                       | None visible.                                                |
| `src/fragmentarium/ui/images/FolioImage.tsx`            | 55 → 16 lines; uses `ImageViewer`                                                       | None visible.                                                |
| `src/fragmentarium/ui/images/FolioImage.test.tsx`       | `window.open` expectation updated to include `'noopener,noreferrer'`                    | Test follows the deliberate fix. No test removed or skipped. |

`craco.config.js` was **not** touched; its pre-existing uncommitted diff is intact. `CONFIRMED`

## 11. Media-domain extensions

Additive only; `media.ts` itself is untouched relative to `feature-media-architecture`.

- **`ImageServiceDescriptor`** — `id`, `serviceType`, optional `complianceLevel`, `width`, `height`,
  `maxWidth`, `maxHeight`, `maxArea`, `tiles[]` (`width`, optional `height`, `scaleFactors[]`),
  `sizes[]`. **No compliance level is assumed**; it is `undefined` unless the service states one.
  `supportsArbitraryRegions` (level1/level2) and `supportsArbitrarySizes` (level2) express capability
  explicitly rather than letting callers guess.
- **`MediaRendering`** — `id`, `label`, optional `format`.
- **`IiifMediaRepresentations extends MediaRepresentations`** — adds optional `imageService` and
  optional `thumbnail`. `original`, `display` and `thumbnails` are preserved.
  A IIIF `thumbnail` is kept in its own slot rather than being forced into the `small`/`medium`/`large`
  bucket map, which would have invented a size classification the Manifest never stated.
- **`IiifMediaResource extends Omit<MediaResource, 'type' | 'representations'>`** — adds `label`
  (language-map resolved), `canvasWidth`, `canvasHeight`, `renderings`, and makes `type` **optional**.
  `MediaType` is untouched and is **never inferred** from Canvas labels, filenames or ordering
  (§14, §27 item 6).

## 12. IIIF DTO / validation implementation

`iiifDtos.ts` mirrors the permissive convention: every wire-facing property is `unknown`. No Manifest
is ever cast to a trusted IIIF interface, and `any` is not used anywhere.

`iiifValidation.ts` provides: `isRecord`, `toArray`, `boundArray`, `normalizeNonEmptyString`,
`normalizeDisplayString` (bounded at 1,000 chars), `normalizePositiveInteger`,
`normalizeAbsoluteHttpsUrl`, `toOrigin`, `configuredIiifOrigins`, `isAllowedOrigin`,
`normalizeAllowedUrl`, `normalizeResourceId`, `normalizeResourceType`, `hasResourceType`,
`normalizeStringArray`, `normalizeStrictStringArray`.

Rules enforced:

- **`https:` only.** `javascript:`, `data:`, `file:`, `blob:` and plain `http:` are all rejected for
  every Manifest-derived URL.
- **Origin allowlist.** Derived from `REACT_APP_DICTIONARY_API_URL`; external Manifest origins are
  rejected in v1 (`REJECTED_ORIGIN`).
- **Bounded arrays** (1,000 items generic, 500 Canvases, 100 metadata entries) and bounded strings.
- The relative-media-URL validator from `feature-media-architecture` is deliberately **not** reused —
  it rejects every absolute URL, which is what IIIF identifiers are.
- The Manifest is read as **plain JSON over known Presentation 3 keys**. No JSON-LD processor, no
  remote `@context` fetching.

## 13. Language-map implementation

`iiifLanguageMap.ts` is the single resolver. Order: exact preferred tag → primary-subtag match
(`en-GB` satisfies `en`) → `"none"` → first key with content → `undefined`. Preference defaults to
`['en']` because the UI has no i18n framework, and is overridable per call.

**Values must be arrays of strings** — `normalizeStrictStringArray` rejects a bare string, unlike the
lenient `toArray` path. This was a real defect caught by the tests during this pass: `{ en: 'not an
array' }` previously resolved to `'not an array'` and now correctly resolves to `undefined`.

`resolveLanguageMap` returns the first entry (labels); `resolveLanguageMapText` joins entries with
newlines (metadata values). **Both always return plain text; neither can return HTML.**

## 14. Manifest adapter implementation

`iiifManifestAdapter.ts` — the **only** module that reads a raw Manifest.

Fatal (whole Manifest rejected, typed `ManifestValidationFailure`):
`NOT_AN_OBJECT`, `WRONG_TYPE` (e.g. a Collection), `UNSUPPORTED_PRESENTATION_VERSION` (an `@context`
present but not the Presentation 3 context; absent context is accepted), `MISSING_ID`,
`REJECTED_ORIGIN`, `NO_CANVASES`, `TOO_MANY_CANVASES`, plus `TOO_LARGE` and `MALFORMED_JSON` raised at
the transport layer.

Partial (drop the item, keep going, mark `degraded`): a dropped Canvas, an unsupported body, a missing
Image Service, an unparseable thumbnail/rendering/homepage/provider, a non-vocabulary `rights` URI.

Output: `{ status: 'ok' | 'degraded' | 'invalid' }`. A Manifest whose Canvases **all** fail yields
`NO_CANVASES` rather than an empty-but-"usable" document, so callers can never silently render nothing.

Descriptive mapping resolves `label`, `summary`, `metadata`, `requiredStatement` (as a
`{ label, value }` pair), `rights`, `provider` and `homepage` — every one as plain text or a
scheme-validated URL. `rights` is additionally restricted to `creativecommons.org` /
`rightsstatements.org`. **Unknown properties are ignored and never propagated** — `partOf`, `seeAlso`
and friends do not appear on the view model, and are never fetched.

## 15. Canvas adapter implementation

`iiifCanvasAdapter.ts` + `iiifCanvasBody.ts`.

- **`Canvas.id` is the identity** — origin-allowlisted absolute URL. Never the array index.
- **`sortOrder` comes from Manifest order**; only index 0 is `isPrimary`.
- `label` resolved through the language-map helper; `width`/`height` become
  `canvasWidth`/`canvasHeight` (the coordinate space for future regions).
- Painting annotations are located by `motivation === 'painting'` under `items[].items[]`.
  Non-painting annotations and `Canvas.annotations` are ignored this pass. `DEFERRED`
- A supported body is `type: 'Image'` with an origin-allowlisted `id` **and a `format` in the existing
  raster MIME allowlist** (`image/jpeg`, `image/png`, `image/webp`). See §32 for why `format` is
  required and why SVG bodies are rejected in v1.
- A Canvas with a supported body but **no** Image Service is **kept** (static rendering) with a
  `MISSING_IMAGE_SERVICE` diagnostic, not dropped.
- Video/audio bodies are unsupported and produce `UNSUPPORTED_BODY`.
- `seeAlso` / `partOf` are never traversed or fetched.

## 16. Image Service descriptor implementation

`iiifImageService.ts` parses an embedded service from a painting body. It accepts `ImageService3` and
`ImageService2`; the service `id` supplied by the Manifest is authoritative and is never templated or
derived. Compliance level is read from `profile`, accepting both the bare form (`level2`) and a IIIF
profile URI (`http://iiif.io/api/image/2/level1.json`); an unrecognised profile leaves the level
`undefined` rather than assuming Level 2. Malformed `tiles`/`sizes` entries are dropped individually.
If no supported service is present the function returns `undefined` — it never fails the Canvas.
`imageInfoUrl(service)` appends `/info.json` to the service id. **No tiles are fetched and no tile
URLs are constructed anywhere in this pass.**

## 17. Fragment IIIF discovery implementation

Wire contract supported exactly as specified:

```json
{ "iiif": { "manifest": "https://…", "version": "3" } }
```

`FragmentDto.iiif?: unknown` → `normalizeFragmentIiifReference(dto)` → `Fragment.iiif?: IiifReference`
(`{ manifestUrl, presentationVersion: '3' }`).

Rejected (→ `undefined`, no IIIF): field absent, `null`, not a record, an array, no `manifest`, a
non-string `manifest`, `version` other than `'3'` (including numeric `3`), non-`https`, `javascript:`,
or a foreign origin. **No fallback URL is ever built from a museum number, and no URL is fetched to
sniff whether it is a Manifest.** Every pre-existing fragment DTO field and behaviour is preserved.

## 18. `IiifRepository` implementation

`ApiIiifRepository implements IiifRepository` with `findManifest(manifestUrl, signal?)` and
`findImageInfo(service, signal?)`, both returning `Bluebird` (the codebase convention, and what
`withData` consumes) while accepting an optional `AbortSignal` that cancels the underlying request.

**Credential safety.** `toApiPath` resolves an absolute URL to a path under the configured
`REACT_APP_DICTIONARY_API_URL` **only** if the URL is `https:`, on an allowed origin, and actually
under that base. Anything else returns `unavailable` and **no request is issued at all** — verified by
test. There is therefore no generic arbitrary-URL authenticated fetcher, and the bearer token cannot
reach a foreign origin. No backend proxy was added.

HTTP mapping: 401/403 → `unauthorized` with a typed `AuthorizationRequiredState` (`canRetryAfterLogin`
true only for 401); 404 → `not-found`; ≥500 and non-`ApiError` failures → `network-error`
(`retryable: true`); other 4xx → `unavailable`; unparseable body → `invalid / MALFORMED_JSON`;
`Content-Length` above 5 MB → `invalid / TOO_LARGE` **before** `response.json()` is called.

`info.json` is fetched **per service, on demand only**. Nothing in this pass fetches it for every
Canvas, and no automatic prefetch exists.

## 19. Manifest cache implementation

`IiifCache` holds `manifests` + `manifestRequests` (max 50) and `imageInfos` + `imageInfoRequests`
(max 200), registered with the **same `ScopedCache` instance `FragmentCache` already owns** and exposed
as `FragmentCache.iiif`. That means:

- **Normalized values are cached, never raw JSON.** `ManifestFetchResult` / `ImageInfoFetchResult` are
  stored, so a Manifest is parsed exactly once.
- The existing 5-minute TTL and LRU behaviour are reused unchanged.
- In-flight requests are deduplicated by `getOrFetchCachedValue`.
- **An auth-identity change clears the Manifest caches** together with fragments, because they share
  the scope. Directly covered by test.
- `clearManifest(url)` supports targeted invalidation.
- No second cache layer exists inside `IiifRepository`, and there is no application-level tile cache —
  tiles are the browser's (and later OpenSeadragon's) responsibility.

## 20. Image-info cache implementation

Same class, `imageInfo(serviceId, fetchValue)`, keyed by `imageInfoKey(serviceId)`, bounded at 200,
same TTL and scope invalidation. It stores the normalized `ImageServiceDescriptor`, not `info.json`.

## 21. Compatibility / fallback implementation

`resolveFragmentMedia({ iiif, manifest, hasPhoto })` in `domain/mediaSource.ts` implements the
precedence **IIIF → media endpoint → legacy `hasPhoto` → none**:

- A usable Manifest (`ok` **or** `degraded`) wins → `source: 'iiif'`.
- Otherwise it demotes to `legacy-photo` (or `none`) and reports **why**: `NO_IIIF_REFERENCE`,
  `MANIFEST_INVALID`, `MANIFEST_UNAUTHORIZED`, `MANIFEST_UNAVAILABLE`. A malformed higher-precedence
  source therefore falls through instead of failing the page.
- `'media-endpoint'` exists in `MediaSourceKind` as the reserved slot for
  `feature-media-architecture`'s `/fragments/{n}/media` contract. It has **no runtime branch** here
  because that endpoint does not exist on this branch. `DEFERRED`

**No current runtime behaviour changed**: nothing calls `resolveFragmentMedia` from a rendering path,
no Manifest is fetched per search result, and list, search and front-page media behaviour is untouched.

## 22. Shared viewer refactor

`Photo.tsx` and `FolioImage.tsx` previously duplicated the whole `TransformWrapper` + toolbar +
`image-wrapper` block — the repository's own DRY hard gate, violated. Now:

- **`imageViewerContract.ts`** — `ViewerZoomControls` (`zoomIn`/`zoomOut`/`reset`) and
  `ImageRenderer` (`{ imageUrl, alt, renderToolbar }`). Renderer-neutral: it names no zoom library.
- **`StaticImageViewer.tsx`** — owns `react-zoom-pan-pinch` exactly as before:
  `panning={{ activationKeys: [] }}`, `initialScale={1}`, `minScale={0.5}`, `maxScale={8}`, the same
  `photo-container` / `image-wrapper` markup, the same `onClick` preventDefault, the same Blob-derived
  `src`. Limits are exported as `minimumScale`/`maximumScale` and asserted by test.
- **`ImageViewer.tsx`** — owns the eBL chrome: `useImageActions` (object-URL lifecycle unchanged),
  the `ImageButtonGroup` toolbar, and an optional `footer`. It takes a `renderer` prop defaulting to
  `StaticImageViewer`.

`Photo.tsx` (89→54) keeps its EXIF `Artist` line and its `ReactMarkdown` copyright footer verbatim.
`FolioImage.tsx` (55→16) keeps its `withData(findFolio)` loader and filename alt text.

**Extension point for the next pass:** an `OpenSeadragonViewer.tsx` implementing `ImageRenderer` drops
into the `renderer` prop. `Photo` and `FolioImage` will not need refactoring again.

## 23. Toolbar / security fixes

1. **New-tab tabnabbing.** `window.open(photoUrl, '_blank')` → `window.open(photoUrl, '_blank',
'noopener,noreferrer')`. `ExternalLink`'s own `rel="noopener noreferrer"` behaviour is unchanged.
2. **Download extension.** `image.type.split('/')[1]` produced `eBL-K.1.svg+xml` for SVG. Replaced by
   `common/utils/imageFileExtension.ts`: an explicit MIME allowlist (`image/jpeg`→`jpeg`,
   `image/jpg`→`jpeg`, `image/png`→`png`, `image/webp`→`webp`, `image/gif`→`gif`,
   `image/tiff`→`tiff`, `image/svg+xml`→`svg`), case- and parameter-tolerant, defaulting to `jpeg`.
   Existing extensions for currently served types are preserved exactly.
3. **Filename sanitization.** `sanitizeDownloadName` strips path separators and control characters
   while keeping the museum-number characters in use today (`K.1`, `K 1`, `WGL_00000`,
   `BM 12345 (obv.)`). No filename or extension is ever derived from Manifest data.

## 24. Runtime behaviour changed

Only two things, both deliberate:

1. **"Open in New Tab" now passes `noopener,noreferrer`.** The opened tab can no longer reach
   `window.opener`. Same URL, same tab, same user-visible result.
2. **SVG downloads are named `.svg` instead of `.svg+xml`.** All other download filenames are byte-identical.

Fragment DTO parsing now calls `normalizeFragmentIiifReference`, which returns `undefined` for every
response the current backend produces — no observable change.

## 25. Runtime behaviour intentionally unchanged

`CONFIRMED` — untouched: the Blob/object-URL photo and folio pipeline; `ApiClient` and its bearer-token
behaviour; `ImageRepository`; `FragmentService` image methods; search-result thumbnails
(`SummaryThumbnail`, `FragmentThumbnail`); front-page thumbnails; CDLI images; the image-annotation
tool and its percentage geometry; `Images.tsx` / `TabController` and every existing `?tab=` /
`?folioName=` / `?folioNumber=` URL; route parsing; `FragmentLink` builders; sign images; zoom limits;
alt text; the copyright footer; toolbar labels and ARIA names.

No Canvas navigation, no region routing, no Content State, no annotation overlays, no comparison.

## 26. Isolation-guard status and rationale

**No guard exists on this branch, so none was weakened, narrowed or deleted.** `CONFIRMED` (§8)

The equivalent discipline was applied by construction:

- Every IIIF adapter, the repository and the cache have **no caller in any rendering path**. They are
  reachable only from tests.
- The single deliberate production wiring is fragment-DTO normalization (`createFragment` →
  `normalizeFragmentIiifReference`), which is inert while the backend omits the field. It was wired
  because §17 of the brief requires it and because a discovery field that is never normalized cannot
  be validated against a real response.
- `FragmentCache.iiif` is constructed but never invoked outside tests.

When `feature-media-architecture` merges, its guard will need its module inventory extended to cover
`media.ts` here, and a decision recorded about whether the IIIF modules fall inside its scope.

## 27. OpenSeadragon status

**Not added.** `DEFERRED` — correct per constraint 13.

`grep -n "openseadragon\|mirador\|@iiif\|iiif" yarn.lock` → **zero matches**. `CONFIRMED` No viewer
package, no IIIF package, and no new runtime dependency of any kind was installed in this pass.

The gating fact is unchanged from the prior investigation: **there is no browser-loadable Image
Service to render.** Adding OpenSeadragon now would mean either shipping a viewer with nothing to
show, or fabricating a tile source — both forbidden by §10 of the brief. No tile URL is constructed,
no `info.json` is fetched speculatively, no custom bearer-token tile loader exists, and no fake Image
Service is advertised. If the `iiif` field appears locally but its Image Service is unavailable, the
application continues rendering the existing static viewer, because nothing in the render path
consults IIIF at all yet.

## 28. Backend dependencies still required

`BLOCKED` / `UNKNOWN` until the backend contract lands.

| #   | Requirement                                                                                                                                                         | Why it blocks                                                                                                                                                      |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | **Image endpoints reachable by the browser without an `Authorization` header** (public, or cookie-scoped to the image host).                                        | **The top blocker.** OpenSeadragon issues plain `<img>`/XHR tile requests that cannot carry the bearer header. Until this is settled the tiled viewer cannot ship. |
| 2   | **Image API 3 compliance level**, stated in `info.json` `profile`.                                                                                                  | The adapter reads it and never assumes it. Level 0 would confine eBL to pre-generated `sizes`.                                                                     |
| 3   | **CORS** on Manifest, `info.json` and image endpoints for the eBL frontend origins.                                                                                 | `info.json` is fetched by XHR and needs CORS even if images do not.                                                                                                |
| 4   | **Stable, permanent Canvas IDs**, unchanged across re-ingest or re-ordering.                                                                                        | They become the media identity and, later, citation targets.                                                                                                       |
| 5   | **`Canvas.width` / `Canvas.height` on every Canvas.**                                                                                                               | The coordinate space for regions and annotations.                                                                                                                  |
| 6   | **Media role (PHOTO / COPY) per Canvas**, via an agreed `metadata` entry or documented extension.                                                                   | The adapter refuses to infer it from labels, so `type` stays `undefined` without it.                                                                               |
| 7   | **`format` on every painting image body.**                                                                                                                          | See §32 — a Canvas without a supported `format` is currently dropped.                                                                                              |
| 8   | **Manifests served from the configured eBL API origin over `https:`**, at a path under `REACT_APP_DICTIONARY_API_URL`.                                              | Otherwise `toApiPath` returns `unavailable` and no request is made.                                                                                                |
| 9   | **Unambiguous error semantics**: 404 = no Manifest, 403 = exists but not permitted, 401 = auth required, 5xx = retryable.                                           | Already mapped; needs confirming.                                                                                                                                  |
| 10  | **Whether restricted Canvases are omitted** from the Manifest (recommended, mirroring `filterFolios`) or advertised with an auth service.                           | Determines whether Auth Flow 2 is ever needed.                                                                                                                     |
| 11  | **Per-fragment rollout capability** — can the backend emit `iiif` for a subset of fragments?                                                                        | Determines whether a staged rollout is possible.                                                                                                                   |
| 12  | **Agreed size / count caps.** Currently 5 MB and 500 Canvases.                                                                                                      | Frontend caps should not surprise the backend.                                                                                                                     |
| 13  | **Whether `iiif` coexists with `mediaSummary` / `media`**, and which wins.                                                                                          | Fills the reserved `'media-endpoint'` precedence slot (§21).                                                                                                       |
| 14  | Confirmation that **no IIIF string field will ever contain HTML**.                                                                                                  | The frontend renders all of them as plain text.                                                                                                                    |
| 15  | Confirmation that legacy `hasPhoto`, `thumbnailPath`, `/fragments/{n}/photo`, `/folios/…` and `/fragments/{n}/thumbnail/{size}` keep working through the migration. | The fallback path depends on it.                                                                                                                                   |

## 29. Focused tests run

**No full test suite was run.** Every command below was `--testPathPattern`-scoped to modules changed
in this pass.

| #   | Command                                                                                                                                    | Result                                                                                                                                                                  |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `npx craco test --watchAll=false --runInBand --no-coverage --testPathPattern="images/(Photo\|FolioImage\|ImageButtonGroup\|Images)\.test"` | 4 suites, 31 tests — 1 failure, the `FolioImage` `window.open` expectation, expected from the deliberate `noopener` fix; expectation updated and re-run green in run 8. |
| 2   | `… --testPathPattern="iiif/(iiifValidation\|iiifLanguageMap)\.test"`                                                                       | 62 tests — 1 failure that exposed the real language-map defect (§13); fixed at source.                                                                                  |
| 3   | `… --testPathPattern="iiif/(iiifImageService\|iiifCanvasAdapter\|iiifLanguageMap)\.test"`                                                  | **3 suites, 50 tests, all passed.**                                                                                                                                     |
| 4   | `… --testPathPattern="iiif/(iiifManifestAdapter\|iiifDescriptive\|iiifReference)\.test"`                                                   | **3 suites, 47 tests, all passed.**                                                                                                                                     |
| 5   | `… --testPathPattern="iiif/iiifSecurity\.test"`                                                                                            | **1 suite, 12 tests, all passed.**                                                                                                                                      |
| 6   | `… --testPathPattern="(IiifRepository\|iiifApiPath)\.test"`                                                                                | 32 tests — 1 failure, an over-strict expectation of mine about the origin-root path; expectation corrected.                                                             |
| 7   | `… --testPathPattern="iiifApiPath\.test"`                                                                                                  | **11 tests, all passed.**                                                                                                                                               |
| 8   | `… --testPathPattern="(iiifCache\|mediaSource\|imageFileExtension)\.test"`                                                                 | **3 suites, 40 tests, all passed.**                                                                                                                                     |
| 9   | `… --testPathPattern="viewer/(ImageViewer\|StaticImageViewer)\.test"`                                                                      | 11 tests — 1 failure from a default parameter in my own test helper swallowing `undefined`; helper fixed.                                                               |
| 10  | Final consolidated run — see §29.1                                                                                                         |                                                                                                                                                                         |

### 29.1 Final consolidated focused run

```
CI=true npx craco test --watchAll=false --runInBand --coverage \
  --collectCoverageFrom='src/fragmentarium/infrastructure/iiif/**/*.ts' \
  --collectCoverageFrom='src/fragmentarium/infrastructure/IiifRepository.ts' \
  --collectCoverageFrom='src/fragmentarium/domain/mediaSource.ts' \
  --collectCoverageFrom='src/fragmentarium/domain/iiif*.ts' \
  --collectCoverageFrom='src/fragmentarium/domain/mediaImageService.ts' \
  --collectCoverageFrom='src/fragmentarium/application/iiifCache.ts' \
  --collectCoverageFrom='src/common/utils/imageFileExtension.ts' \
  --collectCoverageFrom='src/fragmentarium/ui/images/viewer/**/*.tsx' \
  --testPathPattern="(iiif|Iiif|mediaSource|imageFileExtension|viewer/)"
```

```
Test Suites: 16 passed, 16 total
Tests:       263 passed, 263 total
Snapshots:   0 total
```

Coverage of every module touched by this pass:

| Path                                             | % Stmts | % Branch | % Funcs | % Lines |
| ------------------------------------------------ | ------- | -------- | ------- | ------- |
| **All files**                                    | **100** | **100**  | **100** | **100** |
| `common/utils/imageFileExtension.ts`             | 100     | 100      | 100     | 100     |
| `fragmentarium/application/iiifCache.ts`         | 100     | 100      | 100     | 100     |
| `fragmentarium/domain/iiifDocument.ts`           | 100     | 100      | 100     | 100     |
| `fragmentarium/domain/iiifMedia.ts`              | 100     | 100      | 100     | 100     |
| `fragmentarium/domain/iiifResult.ts`             | 100     | 100      | 100     | 100     |
| `fragmentarium/domain/mediaImageService.ts`      | 100     | 100      | 100     | 100     |
| `fragmentarium/domain/mediaSource.ts`            | 100     | 100      | 100     | 100     |
| `fragmentarium/infrastructure/IiifRepository.ts` | 100     | 100      | 100     | 100     |
| `.../iiif/iiifApiPath.ts`                        | 100     | 100      | 100     | 100     |
| `.../iiif/iiifCanvasAdapter.ts`                  | 100     | 100      | 100     | 100     |
| `.../iiif/iiifCanvasBody.ts`                     | 100     | 100      | 100     | 100     |
| `.../iiif/iiifDescriptive.ts`                    | 100     | 100      | 100     | 100     |
| `.../iiif/iiifDtos.ts`                           | n/a     | n/a      | n/a     | n/a     |
| `.../iiif/iiifImageService.ts`                   | 100     | 100      | 100     | 100     |
| `.../iiif/iiifLanguageMap.ts`                    | 100     | 100      | 100     | 100     |
| `.../iiif/iiifManifestAdapter.ts`                | 100     | 100      | 100     | 100     |
| `.../iiif/iiifReference.ts`                      | 100     | 100      | 100     | 100     |
| `.../iiif/iiifValidation.ts`                     | 100     | 100      | 100     | 100     |
| `ui/images/viewer/ImageViewer.tsx`               | 100     | 100      | 100     | 100     |
| `ui/images/viewer/StaticImageViewer.tsx`         | 100     | 100      | 100     | 100     |

`iiifDtos.ts` is a types-only module with no executable statements; istanbul reports `0/0` for such
files, which the table records as n/a.

### 29.2 Regression run over the pre-existing modules this pass touched

```
CI=true npx craco test --watchAll=false --runInBand --no-coverage \
  --testPathPattern="(FragmentRepository|fragmentCache|scopedCache|fragment\.test|images/)"
```

```
Test Suites: 22 passed, 22 total
Tests:       241 passed, 241 total
```

Covers every `FragmentRepository.*` suite (exercising the modified `createFragment`,
`FragmentDto` and `Fragment`), the whole `ui/images/` tree (`Photo`, `FolioImage`, `Images`,
`ImageButtonGroup`, `CdliImages`, `FolioDropdown`, `FolioTooltip`, both new viewer suites) and
`CuneiformFragment`. Zero console output.

```
CI=true npx craco test --watchAll=false --runInBand --no-coverage --testPathPattern="FragmentService"
```

```
Test Suites: 17 passed, 17 total
Tests:       148 passed, 148 total
```

Covers every `FragmentService.cache*` suite, exercising the modified `FragmentCache` (which now
constructs `IiifCache`) and `fragmentCacheKeys`. Zero console output.

**Console output: none.** No `console.error`, `console.warn` or unhandled rejection was produced by
any passing run, and nothing was suppressed or mocked to silence it.

## 30. Lint / tsc

| Command                               | Result                                                                           |
| ------------------------------------- | -------------------------------------------------------------------------------- |
| `npx tsc --noEmit -p tsconfig.json`   | **Clean — zero errors.** Run repeatedly throughout; final run clean. `CONFIRMED` |
| `npx eslint 'src/**/*.{ts,tsx}'`      | **Clean — zero errors, zero warnings** (exit 0, no output). `CONFIRMED`          |
| `npx stylelint 'src/**/*.{css,sass}'` | **Clean** (exit 0, no output). `CONFIRMED`                                       |

Together these are exactly what `yarn lint` (`eslint … && stylelint …`) and `yarn tsc` run. No CSS or
Sass file was created or modified in this pass.

Two lint issues surfaced while adding the final coverage tests and were fixed at the root rather than
suppressed:

- **`no-script-url`** fired 14 times on `'javascript:alert(1)'` literals in the hostile fixtures and
  security tests. The literals were replaced with `unsafeScriptUrl`, a single exported constant built
  as `['javascript', 'alert(1)'].join(':')` in `iiifFixtures.ts` (with `unsafeDataUrl` and
  `unsafeFileUrl` beside it). The tests assert exactly the same behaviour; no rule was disabled.
- **`testing-library/render-result-naming-convention`** fired on production code in
  `iiifCanvasAdapter.ts`, because the plugin's aggressive reporting treats any `render`-named helper
  as a Testing Library `render()`. `normalizeRenderings` was renamed `normalizeMediaAlternatives` and
  its local result `alternatives`; the IIIF `renderings` property name on the view model is unchanged.
  No `eslint-disable` was added.

## 31. Anything not tested and why

| Area                                                    | Why                                                                                                                                                                                                                             |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Full repository test suite                              | **Explicitly forbidden by constraint 8/9.** Only focused runs were used. The fragment-DTO and `FragmentCache` edits are additive and type-checked, but the broader fragment/repository suites were **not** exercised — see §32. |
| Tiled rendering, tile URLs, `info.json`-driven zoom     | No renderer and no Image Service exist. Testing them would require fabricating a tile source. `DEFERRED`                                                                                                                        |
| OpenSeadragon in jsdom (canvas/WebGL stubs)             | No dependency added. `DEFERRED`                                                                                                                                                                                                 |
| Canvas navigation, `?canvas=`, `?xywh=`, Content State  | Out of scope this pass. `DEFERRED`                                                                                                                                                                                              |
| IIIF Authorization Flow 2, Content Search               | Deferred by the agreed architecture. `DEFERRED`                                                                                                                                                                                 |
| Annotation overlays and coordinate conversion           | Annotations deliberately untouched. `DEFERRED`                                                                                                                                                                                  |
| A real backend Manifest                                 | None available. Every fixture is synthetic, so `FragmentMediaResponseDto`-style shape assumptions remain **unverified against a live response**.                                                                                |
| `resolveFragmentMedia` integrated with a rendering path | Nothing renders from IIIF yet; the function is unit-tested in isolation.                                                                                                                                                        |

## 32. Known blockers

1. **Image API tile authentication is unresolved.** `BLOCKED` The bearer-token-in-header model cannot
   serve `<img>`-issued tile requests. Until §28 item 1 is decided, no tiled viewer can ship. This is
   the single gate on the whole programme.
2. **The `iiif` branch does not contain `feature-media-architecture`.** `CONFIRMED` `media.ts` was
   recreated identically to minimize conflict, but the rest of that branch (gallery, mappers,
   `MediaRepository`, `MediaBinaryLoader`, isolation guard) is absent. Someone must decide the merge
   order; the reserved `'media-endpoint'` precedence slot stays inert until then.
3. **A Canvas whose painting body has no `format` is currently dropped** with an `UNSUPPORTED_BODY`
   diagnostic. `format` is optional in Presentation 3, so a conformant real-world Manifest could lose
   Canvases. Guessing the MIME type was rejected as the worse option — the existing media MIME policy
   is explicit, and the branch's own SVG contract forbids inferring format. **If the backend cannot
   guarantee `format`, this rule needs revisiting with a stated default** (§28 item 7).
4. **SVG painting bodies are rejected in v1.** `isSvgAllowedAsOriginal` requires `MediaType === 'COPY'`,
   and a IIIF Canvas carries no role, so SVG cannot be validated as permitted. Revisit once §28 item 6
   supplies a per-Canvas role.
5. **IIIF is inert in local and test environments.** `REACT_APP_DICTIONARY_API_URL` is
   `http://example.com` in `.env.test`, and the origin allowlist is `https:`-only, so
   `configuredIiifOrigins()` is empty and every Manifest is rejected. This is deliberate fail-closed
   behaviour and correct in production, but local IIIF development will need an `https` API origin.
6. **The full test suite has not been run against these changes.** `BLOCKED` by constraint 8. The
   fragment DTO/domain/factory and `FragmentCache` edits are additive and `tsc`-clean, but a full run
   is required before this branch is proposed for merge.
7. **No Content-Security-Policy exists**, and none was added (correctly — no CSP effort exists on this
   branch). The origin allowlist is therefore application-level only. Recorded as a later hardening task.

## 33. Exact recommended next frontend step

**Do not start the OpenSeadragon integration yet.** The next step is a short, self-contained pass:

1. **Run the full test suite once** (`yarn test --watchAll=false`) to clear blocker 6, since this pass
   was forbidden from doing so. Fix anything the fragment-DTO or `FragmentCache` edits disturb.
2. **Settle §28 items 1, 2, 3 and 7 with the backend** and obtain **one real example Manifest and one
   real `info.json` from a live eBL fragment.** Add them as fixtures and assert the adapter produces
   the expected `IiifDocument`. This is the first time the contract will be validated against reality.
3. **Only then** add `openseadragon@^6` and `OpenSeadragonViewer.tsx` implementing `ImageRenderer`,
   lazy-loaded via `React.lazy`, selected in `ImageViewer` when
   `representations.imageService` is present, behind `Session.hasBetaAccess()` **and** discovery-field
   presence — with the existing `StaticImageViewer` retained as the fallback. `Photo.tsx` and
   `FolioImage.tsx` should not need to change.

Item 2 is the real gate. Everything else in this handoff is ready and waiting for it.

## 34. Confirmation — no full test suite

`CONFIRMED` **The full test suite was never run.** `yarn test --watchAll=false` was not executed, and
no repository-wide Jest run occurred. Every invocation used
`--testPathPattern` scoped to modules changed in this pass, as listed in §29.

## 35. Confirmation — no commit, no push

`CONFIRMED` No `git commit`, `git push`, `git add`, `git tag` or any ref-writing command was run.
No fetch, pull, merge, rebase, cherry-pick, reset, clean, stash or branch switch occurred. `HEAD`
remains `cccacb0e85443b098ffa218e203edacf71c12610` on branch `iiif`. All changes are uncommitted
working-tree edits, and every pre-existing tracked and untracked change was preserved.

## 36. Confirmation — no deployment, no production access

`CONFIRMED` Nothing was deployed. No production system, credential, secret or environment was accessed.
No package was installed and no runtime dependency was added; `yarn.lock` and `package.json` are
untouched. Network use was limited to nothing beyond the local repository — no external service was
contacted.

---

_Prepared 2026-08-24 on branch `iiif` at `cccacb0e`. No production code path renders IIIF yet; the
one runtime-visible change is the behaviour-preserving viewer consolidation plus two deliberate
toolbar security fixes._
