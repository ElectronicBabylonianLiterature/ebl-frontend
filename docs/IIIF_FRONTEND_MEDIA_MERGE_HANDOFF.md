# IIIF Frontend × Media Architecture Merge Handoff

## 1. Verdict

**Merged successfully, uncommitted, zero Git conflicts, zero test failures.**

`feature-media-architecture` is merged into the working tree of `iiif` with
`--no-commit --no-ff`. The entire uncommitted IIIF implementation is preserved.
Both foundations now coexist: the tested media architecture (domain, DTOs,
mappers, gallery helpers, URLs, repository contracts, isolation guard) and the
IIIF implementation (Presentation parsing, Image Service, discovery, repository,
cache, source resolver, shared viewer refactor).

Three reconciliation edits were required, all documented below:
the isolation guard, `iiifMedia.ts`'s import kind, and the source-precedence
resolver.

## 2. Repository path

`/workspaces/ebl-frontend` (package `ebl-frontend`, remote
`https://github.com/ElectronicBabylonianLiterature/ebl-frontend.git`)

## 3. Starting `iiif` HEAD

`cccacb0e85443b098ffa218e203edacf71c12610` — _Update Assurbanipal font (#789)_

`HEAD` is unchanged: the merge is staged but not committed.

## 4. `feature-media-architecture` SHA

`7e5583d7127fb52c12538b545f49352fd160a5c3` — _fix: fixed more bugs_

The branch is local-only (no upstream). 16 commits ahead of the merge-base.

## 5. Merge-base

`cccacb0e85443b098ffa218e203edacf71c12610` — identical to the `iiif` HEAD.
`iiif` was 0 ahead / 16 behind, so no tracked-file divergence existed. All
reconciliation risk sat in the **uncommitted** working tree, not in Git history.

## 6. Initial tracked/untracked state

60 porcelain entries:

- 10 tracked files with unstaged modifications
- 48 paths staged (adds and modifications)
- 12 untracked paths, including the whole untracked `docs/` directory

No merge, rebase, or cherry-pick was in progress.

`feature-media-architecture` changes 29 paths: 27 additions plus modifications to
`src/fragmentarium/application/fragmentServicePorts.ts` and
`src/fragmentarium/ui/images/Photo.test.tsx`. It tracks no `docs/` files (the
media docs were added at `f4055e51`/`501c817a` and removed at `3944b686`), so the
untracked local `docs/` directory could not collide.

Feature-branch foundation confirmed present before merging: `domain/media.ts`,
`domain/mediaGallery.ts`, `infrastructure/mediaDtos.ts`, the four media mapper
files plus the `mediaMapper.ts` barrel, `mediaMapperValidation.ts`,
`infrastructure/mediaUrls.ts`, `application/MediaRepository.ts`,
`application/MediaBinaryLoader.ts`,
`test-support/mediaArchitectureIsolationGuard.ts` and its test, and
`infrastructure/mediaArchitectureIsolation.test.ts`.

## 7. Safety snapshot location

`/tmp/claude-1000/-workspaces-ebl-frontend/be5b0a74-beba-4d70-bfd5-281372a50741/scratchpad/merge-snapshot/`

Contents:

| File                                                  | Purpose                                                           |
| ----------------------------------------------------- | ----------------------------------------------------------------- |
| `worktree-vs-head.patch`                              | `git diff HEAD --binary`                                          |
| `index-vs-head.patch`                                 | `git diff --cached --binary`                                      |
| `worktree-vs-index.patch`                             | `git diff --binary`                                               |
| `status-before.txt`                                   | `git status --porcelain=v1`                                       |
| `staged-before-merge.txt`                             | the 48 staged paths                                               |
| `untracked.txt`, `fma-tree.txt`, `fma-changed.txt`    | collision inputs                                                  |
| `files/`                                              | byte copies of all 74 modified + untracked files, paths preserved |
| `media.fma.ts`, `media.worktree.ts`, `media.index.ts` | `media.ts` comparison                                             |
| `Photo.tsx.mutation-backup`                           | backup for the guard mutation experiment                          |

Nothing was stashed, reset, cleaned, or discarded.

## 8. Untracked collision paths discovered

`git ls-files --others --exclude-standard` ∩ `git ls-tree -r feature-media-architecture`
→ **none**.

The only effective collision was a path staged as an add rather than left
untracked (§9).

## 9. Modified tracked-path collisions discovered

- Staged paths ∩ feature-branch-changed paths: **`src/fragmentarium/domain/media.ts`** (only)
- Unstaged worktree modifications ∩ feature-branch-changed paths: **none**

A second, non-path-specific obstacle appeared: the `ort` strategy refuses a
non-fast-forward merge while the index differs from `HEAD` **at all**, so the
first attempt listed all 48 staged paths, not just the true collision.

## 10. Files temporarily backed up

All 74 modified/untracked files were copied into
`merge-snapshot/files/` before anything was touched. Two paths were then
temporarily manipulated:

1. `src/fragmentarium/domain/media.ts` — unstaged with
   `git rm --cached` and its working-tree copy removed, so Git could write the
   tracked branch version. Proven byte-identical first (§14).
2. The 48 staged paths — index entries removed with a path-specific
   `git restore --staged` (working tree untouched), then re-staged after the
   merge. No `git stash`, no `git reset`, no `git clean`, no broad restore.

Post-merge verification: all 74 snapshot files present and byte-identical.
The final verification pass reports exactly three differences, all deliberate
edits made during reconciliation: `mediaSource.ts`, `mediaSource.test.ts`,
`iiifMedia.ts`.

## 11. Merge command

```
git merge --no-commit --no-ff feature-media-architecture
```

Result: `Automatic merge went well; stopped before committing as requested`.

## 12. Git conflicts encountered

**None.** `git diff --name-only --diff-filter=U` is empty, `git diff --check`
and `git diff --cached --check` are clean, and a repository-wide search finds no
conflict markers. The merge-base equalled `HEAD`, so Git had no textual conflict
to resolve; the real reconciliation was semantic and is covered in §15–§22.

## 13. Conflict resolution decisions

No `ours`/`theirs` selection was used anywhere — there was nothing to select.
The semantic reconciliation decisions are:

1. Keep the tracked feature-branch `media.ts`; delete the identical untracked copy.
2. Keep the media and IIIF URL validators separate (§16).
3. Keep `MediaRepository` and `IiifRepository` separate, with their existing
   async conventions (§17).
4. Make `iiifMedia.ts`'s `media` import type-only rather than exempting it (§20).
5. Narrow the isolation guard explicitly for the one genuine runtime import (§20).
6. Extend the source resolver so `media-endpoint` stops being inert (§18).

## 14. `media.ts` byte-equivalence result

**Confirmed byte-identical.** sha256
`024378afc8f822c4e94d055ab99d76ce14c0241446ce2cf98dac1db907ecb05c` for all three
of: the pre-merge working-tree copy, the pre-merge index blob, and
`feature-media-architecture:src/fragmentarium/domain/media.ts`. `diff -u`
reported no differences. After the merge, the file Git wrote hashes to the same
value.

`media.ts` was **not edited**. The handoff's claim was verified, not assumed.

## 15. Media-domain reconciliation

`src/fragmentarium/domain/media.ts` is now tracked from the feature branch and is
the single source of media domain truth. No IIIF concept was moved into it.

IIIF-specific domain extensions stay in their additive files:

| Module                        | Role                                            |
| ----------------------------- | ----------------------------------------------- |
| `domain/mediaImageService.ts` | Image API service descriptor + compliance level |
| `domain/iiifMedia.ts`         | `IiifMediaResource` extending `MediaResource`   |
| `domain/iiifDocument.ts`      | Normalized Manifest document and reference      |
| `domain/iiifResult.ts`        | Manifest/image-info fetch result unions         |
| `domain/mediaSource.ts`       | Source precedence resolver                      |

`iiifMedia.ts` composes over the media domain rather than duplicating it:
`IiifMediaRepresentations extends MediaRepresentations`, and `IiifMediaResource`
is `Omit<MediaResource, 'type' | 'representations'>` plus IIIF fields. The one
edit made here was changing its `fragmentarium/domain/media` import to
`import type` — every name it imports is a type, so TypeScript erases the import
entirely and there is no runtime dependency.

`fragmentServicePorts.ts` now re-exports `ThumbnailSize` from
`fragmentarium/domain/media` (a feature-branch change) via a type-only import, so
the media domain is the single definition of that union.

## 16. Media-mapper reconciliation

The feature branch's mapper behaviour is preserved unchanged. No mapper file was
edited.

**The two URL validators remain deliberately separate — this is a security
boundary, not accidental duplication:**

| Concern                 | Module                                                                                        | Rule                                                                                         |
| ----------------------- | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| eBL media endpoint      | `infrastructure/mediaMapperValidation.ts` → `normalizeRelativeMediaUrl`                       | must start with a single `/`, rejects `//`, rejects `\ ? #`, rejects `..` traversal segments |
| IIIF Presentation/Image | `infrastructure/iiif/iiifValidation.ts` → `normalizeAbsoluteHttpsUrl` / `normalizeAllowedUrl` | must parse as an absolute URL, `https:` only, origin must be in the configured allowlist     |

Merging them would let a relative path satisfy an IIIF check or let an absolute
foreign URL satisfy a media check. Neither was weakened, and no cross-import was
introduced between the two modules.

The two modules each define their own small `isRecord`, `normalizeNonEmptyString`
and `normalizePositiveInteger` helpers. This duplication is retained on purpose:
sharing them would create an import edge from IIIF infrastructure into a guarded
media architecture module, trading a trivial duplication for a real architectural
coupling. Documented here rather than silently collapsed.

Untouched and still green: `mediaDtos.ts`, `mediaMapperValidation.ts`,
`mediaRepresentationMapper.ts`, `mediaResourceMapper.ts`, `mediaSummaryMapper.ts`,
`mediaMapper.ts`, `mediaGallery.ts`, `mediaUrls.ts`.

## 17. MediaRepository / IiifRepository reconciliation

Both are preserved as separate responsibilities. Neither was collapsed into the
other, and no combined repository was introduced.

| Repository                      | Responsibility                                                    | Async type       | Cancellation           |
| ------------------------------- | ----------------------------------------------------------------- | ---------------- | ---------------------- |
| `application/MediaRepository`   | `/fragments/{number}/media` metadata → `readonly MediaResource[]` | native `Promise` | `signal?: AbortSignal` |
| `application/MediaBinaryLoader` | authenticated media binaries → `Blob`                             | native `Promise` | `signal?: AbortSignal` |
| `infrastructure/IiifRepository` | Presentation Manifest + on-demand `info.json`                     | `Bluebird`       | `signal?: AbortSignal` |

**Async convention decision.** `MediaRepository` and `MediaBinaryLoader` are
contract interfaces with no implementation; their tests satisfy them with plain
`async` functions. `ApiIiifRepository` is a real implementation over `ApiClient`,
which returns `Bluebird` throughout, and `ScopedCache.getOrFetch` is
`Bluebird`-typed, so `Bluebird` is the correct choice there. No conversions were
introduced in either direction. When `MediaRepository` gains an `ApiClient`-backed
implementation, a `Bluebird` already satisfies a `Promise` return type, so that
implementation needs no adapter either. `AbortSignal` support is present on all
three and was left in place.

## 18. Source-precedence reconciliation

`resolveFragmentMedia` previously could never return `media-endpoint`: the kind
existed in `MediaSourceKinds` but nothing could produce it, because the media
architecture was absent. That is now fixed in `domain/mediaSource.ts`.

Added:

```ts
export type MediaEndpointResult =
  | { readonly status: 'ok'; readonly media: readonly MediaResource[] }
  | { readonly status: 'empty' }
  | { readonly status: 'invalid' }
  | { readonly status: 'unavailable' }

export type ResolvedMediaResource = IiifMediaResource | MediaResource
```

`FragmentMediaSources` gained `readonly mediaEndpoint?: MediaEndpointResult`, and
`LegacyMediaFallback` gained an optional `mediaEndpointReason`
(`MEDIA_EMPTY | MEDIA_INVALID | MEDIA_UNAVAILABLE`), emitted only when a media
endpoint result was actually present and unusable.

Resulting precedence:

1. **IIIF** — only when an `IiifReference` exists _and_ the Manifest result is
   `ok` or `degraded` (`isUsableManifest`).
2. **media-endpoint** — when the endpoint returned `ok` with at least one
   `MediaResource`. The fallback record still carries the reason IIIF was not
   used, so the demotion is observable.
3. **legacy-photo** — when `hasPhoto` is true. Carries both the IIIF reason and,
   when applicable, the media-endpoint reason.
4. **none**.

Constraint compliance:

- No fake `MediaResource` is ever constructed. The `media-endpoint` branch
  returns exactly the resources it was handed; the legacy and none branches
  return `[]`, as before. `ResolvedMediaResource` is a union rather than a cast,
  so `MediaResource`'s required `type` is not silently widened.
- `normalizeCompatibleMediaSummary` and its `hasCriticalError` semantics are
  **unchanged**. The resolver does not consume normalized summaries: a normalized
  legacy summary and a primary-less endpoint summary are indistinguishable, so
  classifying a search row from the summary alone would be guesswork. Search-row
  behaviour therefore stays exactly as it is.
- The resolver is pure and performs no I/O, so nothing added a Manifest fetch or
  a media fetch per search result.

**Remaining call site (deliberately not wired).** Nothing calls
`resolveFragmentMedia` in production. The resolver/application boundary is
prepared; the wiring belongs in the OpenSeadragon pass and is:

`src/fragmentarium/ui/images/Photo.tsx` (or the component that replaces it in the
viewer integration) should obtain `fragment.iiif`, ask
`FragmentService`/`FragmentCache.iiif` for the Manifest for that reference only
on the fragment detail view, optionally ask a future `ApiMediaRepository` for
`/fragments/{number}/media`, and pass
`{ iiif, manifest, mediaEndpoint, hasPhoto }` to `resolveFragmentMedia`.

## 19. Cache reconciliation

The feature branch adds no cache code, so nothing competed with the IIIF caches.
Verified after the merge:

- One `ScopedCache` identity boundary. `FragmentCache` constructs
  `new ScopedCache(getCacheScope)` once and passes that same instance to
  `new IiifCache(this.scoped)`.
- `IiifCache` registers all four of its maps (manifests, manifest requests,
  image infos, image-info requests) through `scoped.register(...)`, so an
  auth/scope change clears entitlement-sensitive Manifest and image-info data
  along with everything else.
- No duplicate Manifest cache, no raw Manifest cache: `IiifCache.manifest` stores
  the **normalized** `ManifestFetchResult`, never the raw JSON.
- No React or application-level tile cache exists.
- Existing `FragmentCache` behaviour, including the media thumbnail cache and its
  `thumbnailKey` keying, is untouched. `manifestKey` and `imageInfoKey` are new,
  additive key builders alongside it.
- No parallel or conflicting cache abstraction was introduced by the merge.

## 20. Isolation-guard reconciliation

The guard and its tests are preserved, not deleted. Two genuine post-merge
failures were found and fixed at the root.

### Failure 1 — inventory discovery

`findExpectedMediaArchitectureModules` discovers every non-test file under
`src/fragmentarium/**` whose basename matches `/^media/i`. Two IIIF modules match
that naming convention without belonging to the media architecture:
`fragmentarium/domain/mediaImageService` and `fragmentarium/domain/mediaSource`.

**Change.** Added an explicit, enumerated `iiifArchitectureModules` list plus
`isIiifArchitectureModule`, and `isMediaArchitectureFile` now excludes exactly
those paths. The discovery test still fails for any _new_ media-named module that
is not classified, so the inventory remains non-vacuous. Both modules stay inside
the scanned production surface (`isProductionSourceFile` returns `true` for
them), so they are still checked for forbidden imports themselves.

### Failure 2 — production imports of `fragmentarium/domain/media`

Two IIIF files imported the media domain:

- `domain/iiifMedia.ts` imported only types. **No guard change:** the import was
  converted to `import type`, so it is erased at compile time and the guard's
  pre-existing type-only exemption applies. There is no runtime import.
- `infrastructure/iiif/iiifCanvasBody.ts` needs the runtime value
  `isRasterMediaMimeType` to decide whether a Canvas body is a safe raster image.
  Reimplementing it would violate DRY and duplicate a security-relevant check.

**Change.** Added an explicit `mediaDomainConsumers` allowlist and
`mediaDomainModule` constant. `findMediaArchitectureReferences` now drops a
reference only when _both_ the importing file is on that one-entry allowlist
_and_ the specifier is exactly `fragmentarium/domain/media`. Every other guarded
module remains forbidden for that file, and the module remains forbidden for
every other file.

### Non-vacuity and mutation coverage

New file `src/test-support/mediaArchitectureIsolationGuard.exemptions.test.ts`
(125 lines) proves:

- both exemption lists are non-empty and every entry exists on disk;
- IIIF modules are absent from `mediaArchitectureModules` yet still production-scanned;
- disk discovery still equals the inventory, and an unexempted media-named path
  is still classified as a media architecture file;
- the exemption is _necessary_: parsing the real `iiifCanvasBody.ts` yields a
  non-type-only `import` reference to the media domain module;
- the exempted consumer is still flagged for `mediaMapper`, `mediaUrls`,
  `MediaRepository`, `MediaBinaryLoader` and `mediaGallery`;
- an unexempted file importing the media domain module is still flagged, by both
  alias and relative specifier.

An additional end-to-end mutation was run manually: appending
`export { isRasterMediaMimeType } from 'fragmentarium/domain/media'` to the real
`src/fragmentarium/ui/images/Photo.tsx` made
`mediaArchitectureIsolation.test.ts` fail on the real source-tree scan. The file
was then restored and verified byte-identical to the snapshot.

### What was checked and needed no guard change

The IIIF work's deliberate runtime changes — fragment DTO normalization of the
optional `iiif` field (`fragmentFactories.ts` → `iiif/iiifReference.ts`), the
shared static viewer refactor, and `FragmentCache.iiif` construction — import no
media architecture module. `fragmentServicePorts.ts` imports `ThumbnailSize`
type-only. None of these required an exemption.

### Related DRY fix

`createMediaResource` was extracted from `mediaGallery.test.ts` into
`src/test-support/media-fixtures.ts` and reused by `mediaSource.test.ts` rather
than duplicated. It imports `MediaResource` type-only, so it introduces no
guarded runtime import.

## 21. Viewer-refactor preservation

`feature-media-architecture` touches no viewer source file, so the refactor
survived intact and was verified after the merge:

- `viewer/ImageViewer.tsx` — owns object-URL lifecycle, download and new-tab
  handlers, and the shared toolbar; delegates pixels to a renderer.
- `viewer/StaticImageViewer.tsx` — the default renderer, `react-zoom-pan-pinch`,
  `minScale 0.5` / `maxScale 8`, unchanged from the pre-refactor values.
- `viewer/imageViewerContract.ts` — the renderer-neutral contract
  (`ImageRendererProps`, `ViewerZoomControls`, `ImageRenderer`).
- `Photo.tsx` and `FolioImage.tsx` both reduced to a single `ImageViewer` usage;
  the duplicated `TransformWrapper` + toolbar block is gone from both.
- `window.open(url, '_blank', 'noopener,noreferrer')` in `ImageButtonGroup.tsx`.
- `imageDownloadFileName` MIME-to-extension allowlist in
  `common/utils/imageFileExtension.ts`.

The feature branch's one viewer-adjacent change is an _addition_ to
`Photo.test.tsx` asserting the photo action toolbar still exists. It passes
against the refactored `Photo.tsx`, which is exactly the regression check that
change was written to provide.

`renderer?: ImageRenderer` on `ImageViewer` is the clean extension point for the
OpenSeadragon pass: a tiled renderer drops in without touching `Photo`,
`FolioImage`, or the toolbar.

## 22. Security-boundary preservation

Verified after the merge:

| Boundary                                         | Status                                                                                                                                                                             |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| External IIIF origins rejected                   | `normalizeAllowedUrl` + `isAllowedOrigin` against `configuredIiifOrigins()`; `toApiPath` additionally requires the URL to sit under the configured API base or returns `undefined` |
| `https:` only for Manifest-derived URLs          | `allowedUrlScheme = 'https:'`, enforced in `normalizeAbsoluteHttpsUrl` and `toOrigin`                                                                                              |
| No `javascript:`, `data:`, `file:`, `blob:` URLs | same protocol check; covered by `iiifSecurity.test.ts`                                                                                                                             |
| No raw IIIF HTML                                 | no `dangerouslySetInnerHTML`, `<object>` or `<embed>` anywhere in the IIIF or viewer modules                                                                                       |
| No arbitrary authenticated foreign-origin fetch  | `ApiIiifRepository` calls `apiClient.fetch(path, false, {})` — relative path, `authenticate: false`                                                                                |
| Bearer tokens cannot reach foreign origins       | same: authentication is explicitly off and the path is same-origin to the eBL API                                                                                                  |
| SVG safety                                       | `isSvgAllowedAsOriginal` restricts SVG to `COPY`; `iiifCanvasBody` accepts only raster MIME types via `isRasterMediaMimeType`                                                      |
| No automatic `seeAlso`/`partOf` traversal        | never read; asserted absent from the normalized document in `iiifSecurity.test.ts`                                                                                                 |
| No remote JSON-LD context fetching               | `@context` is read as a string array to detect the Presentation version and never dereferenced                                                                                     |
| Manifest size cap                                | `maximumManifestBytes` 5 MiB, plus `maximumCanvases`, `maximumMetadataEntries`, `maximumArrayItems`, `maximumDisplayStringLength`                                                  |

The media branch's relative-URL handling did not weaken IIIF absolute-origin
validation — the two validators never meet (§16).

## 23. Runtime behavior changed, if any

**None user-visible.**

The only production-source change made during reconciliation is
`domain/mediaSource.ts`, which is pure and has no production caller.
`domain/iiifMedia.ts` changed import kind only — types are erased, so the emitted
JavaScript is identical.

Runtime changes already present in the `iiif` working tree before this merge and
carried through unchanged: `FragmentDto.iiif` normalization in
`fragmentFactories.ts`, `Fragment.iiif`, `FragmentCache.iiif` construction, the
viewer refactor, the `noopener,noreferrer` new-tab fix, and the MIME-to-extension
download allowlist. The merge introduced no additional runtime wiring: every
feature-branch module remains architecture-only.

## 24. Runtime behavior intentionally unchanged

- No IIIF in the production viewer.
- No Canvas navigation, no `?canvas=`, no Content State.
- No zoom behaviour change (`minScale`/`maxScale` untouched).
- No visible Photo or Folio change.
- No gallery component.
- No `/fragments/{number}/media` request anywhere.
- Search-result and front-page thumbnails unchanged — still `thumbnailPath` via
  the existing thumbnail cache, no Manifest fetch and no media fetch per row.
- No change to CDLI, folio, annotation, or authentication behaviour.
- `package.json` and `yarn.lock` are byte-unchanged; nothing was installed or
  upgraded.

## 25. OpenSeadragon status

**Not added, by design.** `grep -rin "openseadragon\|mirador"` over `package.json`
and `src/` returns nothing. No viewer library was introduced. The renderer
contract is the prepared seam.

## 26. Backend dependencies still blocking the viewer

OpenSeadragon integration stays deferred until the backend provides:

1. A real Presentation 3 Manifest at a URL under the configured API origin.
2. A real `info.json` for each Image Service.
3. Browser-accessible image requests (the current repository proxies both
   Manifest and `info.json` through the eBL API path, unauthenticated).
4. A known Image API compliance level, so
   `supportsArbitraryRegions`/`supportsArbitrarySizes` resolve to something other
   than `undefined`.
5. CORS headers on the image endpoints.

Additionally, `mediaSummary` does not yet appear on `FragmentDto`, so the
`media-endpoint` precedence branch has no production data source yet.

## 27. Focused test commands / results

Repository-wide Jest was **not** run. Three focused invocations, all via
`CI=true NODE_OPTIONS=--max_old_space_size=1536 npx craco test --runInBand --watch=false --no-coverage --testPathPattern=<pattern>`:

| Pattern                                                                                                                                                                             | Result                             |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| `src/(fragmentarium/(domain/(media\|iiif)\|infrastructure/(media\|Iiif\|iiif))\|test-support/media\|common/utils/imageFileExtension\|fragmentarium/application/(Media\|iiifCache))` | **29 suites, 508 tests, all pass** |
| `src/fragmentarium/(ui/images/\|application/(fragmentCache\|scopedCache\|FragmentService)\|infrastructure/(FragmentRepository\|fragmentFactories))`                                 | **37 suites, 334 tests, all pass** |
| `(mediaArchitectureIsolation\|mediaSource\|mediaGallery)`                                                                                                                           | **5 suites, 91 tests, all pass**   |

Coverage by area:

- **Media architecture** — `media`, `mediaGallery`, `mediaUrls`,
  `MediaRepository`, `MediaBinaryLoader`, the six `mediaMapper.*` suites
  (boundary, compatibility, mime-security, representations, resources, summary,
  url-security), `mediaArchitectureIsolation`, `mediaArchitectureIsolationGuard`
  and the new `mediaArchitectureIsolationGuard.exemptions`.
- **IIIF** — `iiifValidation`, `iiifLanguageMap`, `iiifImageService`,
  `iiifCanvasAdapter`, `iiifManifestAdapter`, `iiifDescriptive`, `iiifApiPath`,
  `iiifReference` (discovery), `iiifDocument`, `IiifRepository`, `iiifCache`,
  `mediaSource` (source precedence), `iiifSecurity` (hostile fixtures).
- **Viewer** — `Photo`, `FolioImage`, `ImageButtonGroup`, `ImageViewer`,
  `StaticImageViewer`, `Images`, plus `CdliImages`, `FolioDropdown`,
  `FolioPager`, `FolioTooltip` and `imageFileExtension`.
- **Fragment integration** — all 11 `FragmentRepository.*` suites (including
  `factories`, which covers the `iiif` DTO normalization) and all 16
  `FragmentService.*` suites, including `cacheScope`, `cacheInvalidation`,
  `cacheEviction`, `cacheStaleResults` and `cacheThumbnails`, which exercise
  `FragmentCache` and `ScopedCache` (neither has a dedicated test file).

**Total: 66 suites, 842 tests, 0 failures, 0 console output.** No console
warnings or errors appeared, and no console method was mocked or suppressed.

## 28. `yarn lint` result

```
$ eslint 'src/**/*.{ts,tsx}' && stylelint 'src/**/*.{css,sass}'
Done in 88.70s.
```

Exit 0, zero errors, zero warnings.

## 29. `yarn tsc` result

```
$ /workspaces/ebl-frontend/node_modules/.bin/tsc --noEmit
Done in 34.83s.
```

Exit 0, zero errors.

## 30. Not tested because the full suite was forbidden

Everything outside the four focused areas above. Specifically not exercised:
corpus, dictionary, bibliography, chronology, dossiers, afo-register, realia,
markup/transliteration rendering, the map feature, routing, auth, `ApiClient`,
`common/**` other than `imageFileExtension`, and all fragmentarium UI outside
`ui/images/`.

The residual risk is low but non-zero and is concentrated in one place: the
feature branch changed `fragmentarium/application/fragmentServicePorts.ts` so
`ThumbnailSize` is re-exported from the media domain rather than declared
locally. That is a type-only change, `yarn tsc` passes repository-wide, and every
`FragmentService.*` and `FragmentRepository.*` suite passes, so any remaining
exposure would have to be a runtime import cycle that type-checking cannot see.
`yarn test --watchAll=false` should be run before this work is proposed for
merge.

`craco.config.js` carries an unstaged, pre-existing local modification adding a
`maplibre-gl` CSS `moduleNameMapper` for Jest. It was preserved untouched and its
effect on map suites was not re-verified here.

## 31. Remaining merge/integration blockers

1. **None for the merge itself.** No unresolved conflicts, no unmerged paths, no
   type or lint errors, no failing focused tests.
2. `resolveFragmentMedia` has no production caller (§18). Intentional for this
   pass, but it is the one piece of architecture that is prepared and not
   connected.
3. `mediaSummary` is absent from `FragmentDto`, so `normalizeCompatibleMediaSummary`
   has no production input and the `media-endpoint` branch has no live data.
4. No `MediaRepository` implementation exists; the interface has no
   `ApiClient`-backed class yet.
5. Backend IIIF prerequisites in §26.
6. Pre-existing repository debt, unrelated to this merge and deliberately not
   touched: roughly 80 `.ts`/`.tsx` files already exceed the 250-line ceiling
   (for example `src/about/ui/bibliography.tsx` at 1290 lines). Every file added
   or edited by this merge is under the ceiling — the largest is
   `iiifManifestAdapter.test.ts` at 227 lines.
7. Task tracking files must be removed before a PR merges: `TASK-IIIF-FE-*.md`,
   `TASK-IIIF-FE-IMPL-*.md`, `TASK-IIIF-MEDIA-MERGE-*.md`, and the three
   `PR_*_REVIEW*.md` files at the repository root.

## 32. Exact recommended next frontend implementation step

**Wire `resolveFragmentMedia` into the fragment detail view behind the existing
renderer contract, without adding a viewer library.**

Concretely, in order:

1. Add `findManifest(reference: IiifReference, signal?: AbortSignal)` to
   `FragmentService`, delegating to `FragmentCache.iiif.manifest(...)` over
   `ApiIiifRepository`. Fetch only on the fragment detail view, never per search
   row.
2. Add a `useFragmentMedia(fragment)` hook that calls `resolveFragmentMedia({
iiif: fragment.iiif, manifest, hasPhoto: fragment.hasPhoto })` and returns
   `ResolvedFragmentMedia`.
3. Have `Photo.tsx` consume it but keep rendering through the existing
   `ImageViewer` default renderer for every source. With no Manifest present the
   resolver returns `legacy-photo`, so behaviour is provably unchanged; a
   `resolved.source === 'iiif'` assertion becomes testable without any pixel
   change.
4. Only then, once the backend clears §26, add the OpenSeadragon renderer as an
   `ImageRenderer` and select it when
   `resolved.source === 'iiif' && hasImageService(media)`.

Step 3 is the last step that is safe today. Steps 1–3 need no backend change,
add no visible behaviour, and leave the viewer swap as a genuinely isolated
follow-up.

The `media-endpoint` branch should stay unwired until the backend ships
`mediaSummary` on the fragment DTO and the `/fragments/{number}/media` route.

## 33. Final `git status`

```
On branch iiif
Your branch is up to date with 'origin/iiif'.

All conflicts fixed but you are still merging.
  (use "git commit" to conclude merge)
```

106 porcelain entries: 78 staged paths (the merged feature-branch files plus the
IIIF work plus the two files added during reconciliation), 1 unstaged tracked
modification (`craco.config.js`, pre-existing and preserved), and 27 untracked
files (`.deepcode/settings.json`, `.devcontainer/devcontainer-lock.json`, the
three `PR_*.md` review files, the six `TASK-*.md` files, and the 15 untracked
`docs/` files, which now include this handoff).

Files added or edited during reconciliation:

| Path                                                                  | Change                                      |
| --------------------------------------------------------------------- | ------------------------------------------- |
| `src/fragmentarium/domain/mediaSource.ts`                             | media-endpoint precedence (79 → 151 lines)  |
| `src/fragmentarium/domain/mediaSource.test.ts`                        | 7 new precedence tests (80 → 162 lines)     |
| `src/fragmentarium/domain/iiifMedia.ts`                               | `import` → `import type`                    |
| `src/test-support/mediaArchitectureIsolationGuard.ts`                 | explicit exemptions (175 → 202 lines)       |
| `src/test-support/mediaArchitectureIsolationGuard.exemptions.test.ts` | new, 125 lines                              |
| `src/test-support/media-fixtures.ts`                                  | new, 22 lines, shared `createMediaResource` |
| `src/fragmentarium/domain/mediaGallery.test.ts`                       | uses the shared fixture (156 → 135 lines)   |
| `docs/IIIF_FRONTEND_MEDIA_MERGE_HANDOFF.md`                           | this document                               |
| `TASK-IIIF-MEDIA-MERGE-todo.md`, `TASK-IIIF-MEDIA-MERGE-log.md`       | new task tracking                           |

No production code comment was added anywhere.

## 34. Confirmation: no unresolved conflicts remain

`git diff --name-only --diff-filter=U` → empty.
`git diff --check` → clean. `git diff --cached --check` → clean.
Repository-wide search for `<<<<<<<`, `=======`, `>>>>>>>` → no matches.

## 35. Confirmation: no commit occurred

`HEAD` is still `cccacb0e85443b098ffa218e203edacf71c12610`.
`.git/MERGE_HEAD` contains `7e5583d7127fb52c12538b545f49352fd160a5c3`.
The merge is staged and uncommitted. `git commit` was never run.

## 36. Confirmation: no push occurred

`git push` was never run. No network Git operation was performed — no `fetch`, no
`pull`, no `clone`. The local `feature-media-architecture` branch was the only
source.

## 37. Confirmation: no full test suite ran

`yarn test --watchAll=false` was never run. Only the three focused
`--testPathPattern` invocations in §27 executed, covering 66 of the repository's
suites.

## 38. Confirmation: no deployment / production access

Nothing was deployed. No production system, credential, service, or endpoint was
accessed. No package was installed or upgraded; `package.json` and `yarn.lock`
are byte-unchanged. `git stash`, `git reset`, `git clean`, `git rebase` and
`git cherry-pick` were never used. The branch remained `iiif` throughout.
