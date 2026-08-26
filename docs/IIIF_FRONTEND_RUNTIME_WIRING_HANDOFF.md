# IIIF Frontend Runtime Wiring Handoff

## 1. Verdict

**Complete, uncommitted, all focused gates green.**

The merged IIIF + media architecture is now connected to real runtime data flow
on the fragment detail view. The chain

```
fragment DTO discovery → IiifReference → FragmentService.resolveMedia
  → IiifRepository.findManifest (through IiifCache/ScopedCache)
  → ApiMediaRepository.findByFragment (structured fallback)
  → resolveFragmentMedia → fragment detail image area
```

executes for real, and `/fragments/{number}/media` has a concrete frontend
repository for the first time.

**Pixels did not change.** Every rendered image still comes from the existing
`findPhoto` Blob → object-URL → `StaticImageViewer` pipeline, for every resolved
source including `iiif`. OpenSeadragon was not added. No `info.json` is requested.
Non-beta users issue zero new network requests.

- 80 focused suites, 983 tests, 0 failures, 0 console output
- `yarn lint` exit 0, `yarn tsc` exit 0
- Isolation guard preserved and proven non-vacuous; exactly one new exemption

## 2. Repository, branch, starting HEAD

- Repository: `/workspaces/ebl-frontend` (remote
  `https://github.com/ElectronicBabylonianLiterature/ebl-frontend.git`)
- Branch: `iiif` (never switched)
- Starting HEAD: `76932a245b48323b450ecb6743ad31dcac878317` — _chore: merge branch_
- HEAD is **unchanged**; nothing was committed.

### Prerequisite gate

The first invocation of this task stopped without editing: `.git/MERGE_HEAD` held
`7e5583d7127fb52c12538b545f49352fd160a5c3`, so the `feature-media-architecture`
merge was staged but uncommitted. That was reported rather than worked around.
The owner concluded and pushed the merge; this pass re-verified `.git/MERGE_HEAD`,
`MERGE_MSG`, `MERGE_MODE`, `rebase-merge`, `rebase-apply` and `CHERRY_PICK_HEAD`
all absent, and 0 unmerged paths, before making any edit.

## 3. Initial working-tree state

At the start of implementation: 13 porcelain entries — 0 staged, 1 unstaged
tracked modification (`craco.config.js`, pre-existing and untouched), 27
untracked paths (task/review markdown at the repository root plus the untracked
`docs/` directory). 0 ahead / 0 behind `origin/iiif`.

Verified ground truth rather than trusting the previous handoff:

| Claim                                            | Verified                                                                  |
| ------------------------------------------------ | ------------------------------------------------------------------------- |
| `MediaRepository` had no concrete implementation | no `implements MediaRepository` / `ApiMediaRepository` anywhere in `src/` |
| `FragmentService` knew nothing of IIIF           | no `IiifRepository` or `findManifest` reference                           |
| `resolveFragmentMedia` had no production caller  | definition at `mediaSource.ts:135` + its own test only                    |
| the media route was unrepresented                | `mediaUrls.ts` per-item builders + tests only, no fetch                   |

## 4. Instructions reviewed

- `.github/copilot-instructions.md` — read in full and followed.
- `.github/instructions/**` — does not exist.
- `CLAUDE.md`, `AGENTS.md` — do not exist.
- `docs/IIIF_FRONTEND_ARCHITECTURE_HANDOFF.md`,
  `docs/IIIF_FRONTEND_IMPLEMENTATION_HANDOFF.md`,
  `docs/IIIF_FRONTEND_MEDIA_MERGE_HANDOFF.md`.

Fresh task tracking created for this pass: `TASK-IIIF-FE-WIRING-todo.md` and
`TASK-IIIF-FE-WIRING-log.md`. Both must be removed before a PR merges, together
with the pre-existing `TASK-IIIF-FE-*`, `TASK-IIIF-FE-IMPL-*`,
`TASK-IIIF-MEDIA-MERGE-*` and `PR_*_REVIEW*.md` files.

### One constraint conflict, resolved in favour of the task

`.github/copilot-instructions.md` treats `yarn test --watchAll=false` as a hard
gate. Task constraints 16–17 forbid running the full suite. The task constraints
were followed. The full suite is therefore **outstanding** (§28).

## 5. `ApiMediaRepository` implementation

**`src/fragmentarium/infrastructure/MediaRepository.ts`** (75 lines), exporting
`class ApiMediaRepository implements MediaRepository` as the default export.

Naming follows the existing repository convention exactly —
`ImageRepository.ts` → `ApiImageRepository`, `FindspotRepository.ts` →
`ApiFindspotRepository` — so the file name does not collide with the application
port at `fragmentarium/application/MediaRepository.ts` while the class name stays
unambiguous.

```ts
findByFragment(
  fragmentNumber: string,
  signal?: AbortSignal,
): Bluebird<readonly MediaResource[]>
```

`Bluebird` satisfies the port's `Promise` return type, so no adapter is needed —
the same conclusion the merge handoff reached in its §17.

The client dependency is a narrow structural port, `MediaJsonApiClient`, rather
than the whole `ApiClient`:

```ts
export interface MediaJsonApiClient {
  fetchJson<Response = unknown>(
    url: string,
    authorize: boolean,
  ): Bluebird<Response>
}
```

Behaviour:

1. Path built with the existing helper — `fragmentMediaCollectionUrl(fragmentNumber)`
   added to `infrastructure/mediaUrls.ts`, which the pre-existing
   `fragmentMediaBase` now delegates to, so the single-media builders and the
   collection builder cannot drift.
2. `apiClient.fetchJson(path, false)` — `false` matches every other fragment
   route; `ApiClient` still attaches the bearer token when the user is
   authenticated, so restricted fragments work unchanged.
3. Normalized exclusively through `normalizeFragmentMediaResponse` from the
   existing `mediaMapper` barrel. **No second DTO shape was introduced** — the
   response is typed as the existing `FragmentMediaResponseDto`.
4. Returns canonical `readonly MediaResource[]`. Raw DTOs never leave the module.
5. Cancellation: an `abort` listener cancels the in-flight Bluebird, mirroring
   `ApiIiifRepository.abortable`.
6. No cache inside the repository.
7. Media identity comes only from the payload's `id` — nothing is inferred from
   URL, museum number, array position, filename or checksum.

## 6. Media endpoint normalization

The repository distinguishes three outcomes:

| Response                                                          | Result                                                                       |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| object with an array `media` (or absent `media`)                  | normalized `MediaResource[]`, invalid entries dropped by the existing mapper |
| non-object, `null`, or `media` present but not an array           | rejects `MalformedMediaResponseError`                                        |
| non-empty `media` array where **every** entry fails normalization | rejects `MalformedMediaResponseError`                                        |

The last rule is the one that makes malformed payloads observable: the merged
mapper silently drops bad resources, so "the backend sent ten resources and we
could use none of them" would otherwise be indistinguishable from an empty
collection. A partially-valid response keeps its valid resources and does not
reject.

`MalformedMediaResponseError` lives in
**`src/fragmentarium/application/fragmentMediaErrors.ts`**. That placement is
deliberate: a file named `fragmentMediaErrors` is not matched by the isolation
guard's `/^media/i` discovery rule, so the unguarded application layer can import
it at runtime without needing an exemption (§18).

## 7. Manifest application-service wiring

`FragmentServiceBase` — not `FragmentService` — gained the media ports and the
three delegating methods, because it is the class that owns the constructor and
`this.cache`. `FragmentService` was already 246 lines and would have breached the
250-line ceiling.

Dependencies are grouped into one optional constructor parameter rather than two
more positional optionals:

```ts
constructor(
  fragmentRepository, imageRepository, wordRepository, bibliographyService,
  getCacheScope: () => string = () => defaultCacheScope,
  protected readonly mediaPorts: FragmentMediaPorts = {},
)

export interface FragmentMediaPorts {
  readonly iiifRepository?: IiifRepository
  readonly mediaRepository?: MediaRepository
}
```

Both ports are optional and default to `{}`, so all four existing construction
sites keep compiling and behaving identically; `resolveMedia` with no ports is
pure and issues no I/O. Both are imported **type-only**.

The methods delegate to free functions in
**`src/fragmentarium/application/fragmentMedia.ts`**, following the established
`fragmentProvenance.ts` pattern:

```ts
findManifest(reference: IiifReference, signal?): Bluebird<ManifestFetchResult>
findMedia(fragmentNumber: string, signal?): Bluebird<MediaEndpointResult>
resolveMedia(fragment: Fragment, options: FragmentMediaOptions): Bluebird<ResolvedFragmentMedia>
```

`InjectedApp.tsx` constructs `ApiIiifRepository` and `ApiMediaRepository` with
`useMemo` over `apiClient`, alongside every other repository, and passes
`{ iiifRepository, mediaRepository }` into `FragmentService`. Both are added to
the memo dependency array. No globals.

## 8. Manifest cache wiring

`findManifest` routes through the cache the merge already built:

```
FragmentCache.iiif.manifest(reference.manifestUrl, () =>
  iiifRepository.findManifest(reference.manifestUrl, signal))
```

Verified by test:

- **Normalized result cached** — `IiifCache.manifest` stores `ManifestFetchResult`.
  A test asserts the cached value is the normalized result and carries no
  `@context`, so no raw Manifest JSON is cached.
- **Cache key is the canonical Manifest URL** — `manifestKey(manifestUrl)`; a
  different URL misses.
- **One in-flight request per Manifest** — two concurrent calls produce one
  repository call.
- **Scope changes clear it** — flipping the cache scope from `guest` to
  `authenticated:someone` forces a refetch, because `IiifCache` registers all
  four of its maps with the single `ScopedCache` instance.
- **Cancellation** — an `AbortSignal` is forwarded to the repository.
- **No Manifest fetch without a valid reference** — `resolveMedia` never calls
  `findManifest` when `fragment.iiif` is `undefined`, and `fragment.iiif` is only
  populated by `normalizeFragmentIiifReference`, which enforces the https origin
  allowlist.

No second Manifest cache was introduced.

## 9. Media endpoint service wiring

`findMedia` maps the repository outcome onto the merged `MediaEndpointResult`
union:

| Repository outcome                  | `MediaEndpointResult`       |
| ----------------------------------- | --------------------------- |
| resources returned                  | `{ status: 'ok', media }`   |
| empty list                          | `{ status: 'empty' }`       |
| `MalformedMediaResponseError`       | `{ status: 'invalid' }`     |
| any other rejection (HTTP, network) | `{ status: 'unavailable' }` |
| no `mediaRepository` port           | `{ status: 'unavailable' }` |

**No media metadata cache was added.** The merged architecture designed none, the
detail view invokes this at most once per resolution, and inventing a second
cache purely because one seemed convenient was explicitly out of scope. The
`ScopedCache` identity boundary is therefore unchanged.

## 10. Fragment-detail source resolver integration

Integration point: **`Images.tsx`**, the fragment detail image area — not `Photo`,
which stays presentational and never sees `ApiClient`, a repository, or a DTO.

- `Images` calls `useFragmentMediaSource(fragment, fragmentService)`
  (`src/fragmentarium/ui/images/useFragmentMediaSource.ts`, 61 lines).
- The hook reads `SessionContext` and `ErrorReporterContext`, calls
  `fragmentService.resolveMedia`, and returns `ResolvedFragmentMedia | undefined`.
- `Images` passes only `resolvedMedia?.source` down to `FragmentPhoto` → `Photo`.

A hook was chosen over `withData` deliberately. `withData` gates rendering on its
promise, which would have delayed the photo Blob behind the resolution and added
a second spinner phase. The hook runs alongside the existing `withData` photo
load and never blocks it — a resolution that never settles still renders the
photo, which is covered by test.

Resolution is wired into the fragment detail flow **only**. Verified by grep:
the sole UI importer of `useFragmentMediaSource` is `Images.tsx`, and the only
production callers of `resolveMedia` are `fragmentServiceBase.ts` and that hook.
Search results, latest transliterations, front page, corpus, CDLI, annotations
and sign images are untouched.

## 11. Runtime source precedence

Matches the tested domain precedence exactly, and is asserted end to end through
the DOM for all four levels.

| Case | Condition                                        | `resolved.source` | Rendered pixels          |
| ---- | ------------------------------------------------ | ----------------- | ------------------------ |
| A    | valid `IiifReference` + `ok`/`degraded` Manifest | `iiif`            | legacy Blob              |
| B    | IIIF unusable + endpoint returned ≥1 resource    | `media-endpoint`  | legacy Blob              |
| C    | nothing usable above + `hasPhoto`                | `legacy-photo`    | legacy Blob              |
| D    | nothing usable at all                            | `none`            | no Photo tab (unchanged) |

When IIIF wins, the media endpoint is **not** requested. Demotions carry their
reason: `MANIFEST_INVALID`, `MANIFEST_UNAVAILABLE`, `MANIFEST_UNAUTHORIZED`,
`NO_IIIF_REFERENCE`, plus `MEDIA_EMPTY`/`MEDIA_INVALID`/`MEDIA_UNAVAILABLE`.

**Unauthorized Manifests** follow the resolver's existing typed behaviour: a 401
or 403 becomes `MANIFEST_UNAUTHORIZED` and demotes to the legacy photo. No
exception reaches the UI, no challenge text is rendered, and the frontend makes
no authorization decision of its own — it only reports what the backend returned.

Case D creates no Photo tab that did not previously exist: the tab is still
driven solely by `fragment.hasPhoto`.

## 12. Beta / discovery gating

`session.hasBetaAccess()` from the existing `SessionContext` gates **both** the
Manifest fetch and the media-endpoint fetch. No new feature-flag framework.

With `betaAccess === false`, `resolveMedia` short-circuits to
`resolveFragmentMedia({ hasPhoto })` and returns a resolved Bluebird — no
repository call, no network request, no added latency. Since `guestSession` is
the `SessionContext` default and returns `false`, every existing test and every
non-beta user is provably on the zero-request path.

Gating the media endpoint too is deliberate: `/fragments/{number}/media` does not
exist on the backend yet, so an ungated fetch would generate a guaranteed 404 per
fragment detail view for every user.

## 13. Actual pixel / rendering source

**Unchanged: `fragmentService.findPhoto(fragment)` → `Blob` → object URL →
`ImageViewer` → `StaticImageViewer` → `<img>`.**

This holds for `resolved.source === 'iiif'` as well, asserted directly: with a
IIIF source resolved, the rendered `<img>` still carries the object-URL `src` and
`findPhoto` is still called with the fragment.

Not done, by design: no tile URL construction, no `info.json` request, no Image
Service used as an `<img>` source, no Blob transport replacement, `findPhoto`
intact, Photo tab intact, no Canvas navigation.

## 14. User-visible behaviour changes

**None.**

The only DOM change is a `data-media-source` attribute on the **existing**
`<footer className="Photo__copyright">` element. It adds no node, no text, no
style and no control — it is a development/test hook so the resolved source is
assertable without rendering diagnostics to users. Tests confirm no diagnostic
text appears for a demoted source.

## 15. User-visible behaviour intentionally unchanged

Verified by the 13 passing `ui/images` suites: Photo tab visibility, Blob
loading, `ImageViewer`, `StaticImageViewer`, zoom limits (`minScale 0.5` /
`maxScale 8`), toolbar, download, open-in-new-tab, attribution/copyright, legacy
image error display, folio behaviour, CDLI behaviour.

Also unchanged: search-result and front-page thumbnails (still `thumbnailPath`
via the existing thumbnail cache — no Manifest and no media request per row),
routing (`?tab=`, folio, CDLI), auth, annotations, sign images.

## 16. Cancellation behaviour

- `ApiMediaRepository` cancels its in-flight Bluebird on `AbortSignal` abort.
- `findManifest` / `findMedia` / `resolveMedia` forward an optional `signal`.
- The hook cancels the resolution promise in its `useEffect` cleanup, so
  abandoning the detail view aborts the underlying request. Verified empirically
  that Bluebird cancellation propagates through `.then` children to the executor's
  `onCancel` (asynchronously), and that `Bluebird.resolve(p)` returns `p`
  unchanged for Bluebird inputs, so wrapping does not break propagation.
- No state update after unmount — covered by a test that settles the promise
  after unmounting.
- Expected aborts produce no console output.

The hook deliberately does **not** pass its own `AbortSignal` into the cached
Manifest fetch. The cache shares one in-flight promise across consumers, so a
per-component signal would let one unmount abort a request another component is
awaiting. Bluebird cancellation is the codebase's established mechanism
(`withData` does the same) and `getOrFetchCachedValue` already handles a
cancelled in-flight entry by discarding and refetching.

## 17. Error-reporting behaviour

Through the existing `ErrorReporterContext`.

**Reported** (unexpected):

| State                                                                                                                                      | Event                    | Payload                     |
| ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------ | --------------------------- |
| advertised IIIF reference but unusable Manifest (includes zero supported Canvases, which normalizes to `NO_CANVASES` → `MANIFEST_INVALID`) | `iiif_manifest_unusable` | `{ event, fragmentNumber }` |
| media endpoint returned an invalid payload                                                                                                 | `fragment_media_invalid` | `{ event, fragmentNumber }` |

**Not reported** (expected fallback states, each covered by a test asserting
silence): no `iiif` field, Manifest unavailable / not-found / network error,
Manifest unauthorized, media endpoint empty, media endpoint unavailable, and a
successful IIIF resolution.

Reports carry only the event name and the fragment number — no raw Manifest
document, no tokens, no binary URLs, no credentials. A test pins the exact
payload keys and the exact error message.

Note (pre-existing, unchanged): `ApiClient.fetch` already calls
`errorReporter.captureException` for every failed request, so a 404 Manifest is
reported by `ApiClient` itself. That is how every repository in the codebase
behaves and was deliberately not modified here.

## 18. Isolation-guard changes

The guard was preserved and tightened, not weakened.

**Inventory.** `fragmentarium/infrastructure/MediaRepository` was added to
`mediaArchitectureModules`. Its basename matches the guard's `/^media/i`
discovery rule, so disk discovery would otherwise disagree with the inventory —
and semantically it _is_ part of the media architecture. Consequence: the sealed
subsystem now includes its own concrete implementation, and mappers, URLs, DTOs,
the port interface and the media domain remain forbidden to every production file.

**Exemption mechanism.** The single-module `mediaDomainConsumers` allowlist was
generalised to a `(consumer, modules)` pair list:

```ts
export const mediaArchitectureExemptions: readonly MediaArchitectureExemption[] =
  [
    {
      consumer: 'fragmentarium/infrastructure/iiif/iiifCanvasBody',
      modules: [mediaDomainModule],
    },
    {
      consumer: compositionRootModule /* 'InjectedApp' */,
      modules: [mediaRepositoryModule],
    },
  ]
```

`mediaDomainModule`, `mediaDomainConsumers` and `isMediaDomainConsumer` are
retained with identical semantics (the consumers list is now derived), so the
pre-existing `mediaArchitectureIsolationGuard.exemptions.test.ts` passes
**unchanged** — no test was rewritten to make this pass.

**Exactly one new exemption**: the composition root may import the concrete media
repository. That is the narrowest possible statement of "the sealed media
architecture is now instantiated, and only here".

**New mutation coverage** —
`src/test-support/mediaArchitectureIsolationGuard.compositionRoot.test.ts`
(139 lines) proves:

- every exempted consumer and module exists on disk, and every exempted module is
  in the architecture inventory;
- the composition root stays inside the scanned production surface;
- the exemption is _necessary_ — parsing the real `InjectedApp.tsx` yields a
  non-type-only `import` of the media repository module;
- the real composition root passes the guard;
- the composition root is **still flagged** for `mediaMapper`, `mediaUrls`,
  `mediaDtos`, `domain/media`, `mediaGallery`, the `MediaRepository` port and
  `MediaBinaryLoader`;
- any other production file importing the media repository is still flagged, by
  alias and by relative specifier;
- the exemptions do not cross over — the composition root is not exempt for the
  media domain, and the media-domain consumer is not exempt for the repository.

**End-to-end mutation.** Appending
`export { ApiMediaRepository } from 'fragmentarium/infrastructure/MediaRepository'`
to the real `src/fragmentarium/ui/images/Photo.tsx` made
`mediaArchitectureIsolation.test.ts`'s real-source-tree scan fail. The file was
restored and verified byte-identical.

No directory was broadly excluded.

## 19. Image Service runtime status

**Dormant, as designed.** Embedded service descriptors are still parsed by
`iiifCanvasAdapter`/`iiifImageService` and preserved in the normalized
`IiifDocument`, but nothing consumes them at runtime. A test asserts
`findImageInfo` is never called during a successful IIIF resolution.

## 20. `info.json` runtime status

**Never requested.** `IiifRepository.findImageInfo` and `imageInfoUrl` have no
production caller — grep confirms the only references are the repository's own
definition and a test double. The `IiifCache.imageInfo` map exists and stays empty.

## 21. OpenSeadragon status

**Not added.** `grep -rin "openseadragon\|mirador"` over `package.json` and `src/`
returns nothing. No viewer library, no Mirador, no state-management library.
`package.json` and `yarn.lock` are byte-unchanged; nothing was installed or
upgraded. `renderer?: ImageRenderer` on `ImageViewer` remains the prepared seam.

## 22. Search / list behaviour verification

- Only `Images.tsx` imports `useFragmentMediaSource`.
- Only `fragmentServiceBase.ts` and that hook call `resolveMedia`.
- No `?canvas=` route exists anywhere.
- Thumbnail surfaces still use `thumbnailPath` and the existing thumbnail cache.
- `FragmentService.query` / `queryLatest` are untouched; all 20 FragmentService
  and cache suites pass.

## 23. Files created / modified

**Created (production)**

| Path                                                    | Lines | Role                                        |
| ------------------------------------------------------- | ----- | ------------------------------------------- |
| `src/fragmentarium/infrastructure/MediaRepository.ts`   | 75    | `ApiMediaRepository`                        |
| `src/fragmentarium/application/fragmentMedia.ts`        | 103   | `findManifest`, `findMedia`, `resolveMedia` |
| `src/fragmentarium/application/fragmentMediaErrors.ts`  | 10    | `MalformedMediaResponseError`               |
| `src/fragmentarium/ui/images/useFragmentMediaSource.ts` | 61    | detail-view resolution hook                 |

**Modified (production)**

| Path                                                   | Lines | Change                                       |
| ------------------------------------------------------ | ----- | -------------------------------------------- |
| `src/InjectedApp.tsx`                                  | 242   | constructs both repositories, injects ports  |
| `src/fragmentarium/application/fragmentServiceBase.ts` | 209   | media ports + 3 delegating methods           |
| `src/fragmentarium/infrastructure/mediaUrls.ts`        | 62    | `fragmentMediaCollectionUrl`                 |
| `src/fragmentarium/ui/images/Images.tsx`               | 209   | hook call, passes source down                |
| `src/fragmentarium/ui/images/Photo.tsx`                | 60    | optional `mediaSource` → `data-media-source` |
| `src/test-support/mediaArchitectureIsolationGuard.ts`  | 235   | pair-based exemptions                        |

**Created (tests / support)**

| Path                                                                       | Lines |
| -------------------------------------------------------------------------- | ----- |
| `src/fragmentarium/infrastructure/MediaRepository.test.ts`                 | 191   |
| `src/fragmentarium/application/fragmentMedia.manifest.test.ts`             | 91    |
| `src/fragmentarium/application/fragmentMedia.endpoint.test.ts`             | 66    |
| `src/fragmentarium/application/fragmentMedia.resolution.test.ts`           | 210   |
| `src/fragmentarium/ui/images/useFragmentMediaSource.test.tsx`              | 130   |
| `src/fragmentarium/ui/images/Images.mediaSource.test.tsx`                  | 93    |
| `src/fragmentarium/ui/images/Images.mediaReporting.test.tsx`               | 125   |
| `src/fragmentarium/ui/images/imagesMediaSource.testSupport.tsx`            | 93    |
| `src/test-support/fragment-media-fixtures.ts`                              | 72    |
| `src/test-support/mediaArchitectureIsolationGuard.compositionRoot.test.ts` | 139   |

**Modified (tests)**

| Path                                          | Lines | Change                                                |
| --------------------------------------------- | ----- | ----------------------------------------------------- |
| `src/fragmentarium/ui/images/Images.test.tsx` | 221   | `resolveMedia` added to the plain-object service mock |

Every file is at or below the 250-line ceiling; the largest is `InjectedApp.tsx`
at 242. No production comment was added anywhere.

Automock-based suites (`FragmentView`, `CuneiformFragment`,
`CuneiformFragmentEditor.security`, `SimpleFragmentView`) needed **no** changes:
`jest.mock('fragmentarium/application/FragmentService')` mocks the inherited
method, and the hook tolerates a service that returns nothing.

## 24. Focused test commands / results

All runs used
`CI=true NODE_OPTIONS=--max_old_space_size=1536 npx craco test --runInBand --watch=false --no-coverage --testPathPattern=<pattern>`.

Final consolidated run:

```
src/(InjectedApp|fragmentarium/(domain/(media|iiif)
  |infrastructure/(media|Media|Iiif|iiif|FragmentRepository|fragmentFactories)
  |application/(Media|iiifCache|fragmentMedia|FragmentService|fragmentCache|scopedCache)
  |ui/(images/|fragment/(CuneiformFragment|FragmentView|SimpleFragmentView)))
  |test-support/media|common/utils/imageFileExtension)
```

**80 suites, 983 tests, 0 failures, 1 snapshot passed, 0 console output.**

New coverage in that total:

| Area                                                                                                                                                                                                                                   | Tests |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| `ApiMediaRepository` — endpoint, encoding, normalization, empty, absent field, three malformed shapes, all-dropped, partial, HTTP failure, one-request-per-lookup, abort, no-signal                                                    | 14    |
| `fragmentMedia` manifest — no repository, cache hit, key by URL, in-flight dedupe, scope invalidation, abort forwarding, normalized-not-raw                                                                                            | 8     |
| `fragmentMedia` endpoint — no repository, ok, empty, invalid, unavailable, abort forwarding, one request                                                                                                                               | 7     |
| `fragmentMedia` resolution — all four precedence levels, no-beta zero-request, no manifest without reference, invalid/unavailable/not-found/network demotions, unauthorized, invalid + unavailable media demotions, no `findImageInfo` | 12    |
| `useFragmentMediaSource` — beta on/off, settles, pending, single resolve, cancellation, no post-unmount update, tolerates nothing                                                                                                      | 8     |
| `Images` media source — four sources stamped, legacy blob preserved under IIIF, toolbar preserved, no diagnostic text, renders when resolution never settles, called once with the beta flag                                           | 9     |
| `Images` reporting — two reported states, payload contains no manifest content, six silent states                                                                                                                                      | 9     |
| Guard composition-root exemptions                                                                                                                                                                                                      | 12    |

Plus the manual end-to-end guard mutation described in §18.

## 25. Lint result

```
$ eslint 'src/**/*.{ts,tsx}' && stylelint 'src/**/*.{css,sass}'
Done in 71.75s.
```

Exit 0, zero errors, zero warnings.

One genuine false positive was handled with two targeted
`// eslint-disable-next-line testing-library/await-async-queries` directives in
`MediaRepository.test.ts` only. `plugin:testing-library/react` treats the
repository method `findByFragment` as a DOM `findBy*` query; the method name is
fixed by the merged `MediaRepository` contract, and the two call sites
deliberately do not await (they assert `isCancelled()`). The repo has ample
precedent for targeted directives. No production file received a directive and no
rule was disabled repository-wide.

## 26. TypeScript result

```
$ tsc
Done in 32.30s.
```

Exit 0, zero errors. No `any` was introduced; `unknown` appears only at the media
response wire boundary before normalization.

## 27. Console-output result

Zero console output across all 80 suites. No console method was mocked,
suppressed, or spied on.

One console-noise defect was found and fixed at its root during this pass: the
error-reporting test initially fell through to the default `ConsoleErrorReporter`.
The fix was to supply an `ErrorReporterContext` test double — the same collaborator
production replaces with `SentryErrorReporter` — not to silence console output.

## 28. Not tested because the full suite was forbidden

Everything outside the 80 suites above: corpus, dictionary, bibliography,
chronology, dossiers, afo-register, realia, markup/transliteration rendering, the
map feature, routing, `ApiClient`, and `common/**` other than
`imageFileExtension`.

Residual risk is low and concentrated in two places:

1. **`FragmentServiceBase` constructor signature.** A sixth optional parameter was
   added. All four construction sites were reviewed and all compile; `yarn tsc`
   passes repository-wide. Any remaining exposure would have to be a call site
   that spreads arguments positionally past `getCacheScope`, which none do.
2. **`InjectedApp.tsx`.** Two repositories were added to the composition root and
   to a `useMemo` dependency array. Both `InjectedApp` suites pass, including
   `InjectedApp.cacheScope.test.tsx`.

`yarn test --watchAll=false` must be run before this work is proposed for merge —
it is also a hard gate in `.github/copilot-instructions.md` that this task's
constraints overrode.

`craco.config.js` still carries its unstaged, pre-existing local `maplibre-gl`
`moduleNameMapper` modification. It was preserved untouched and its effect on map
suites was not re-verified.

## 29. Remaining backend blockers

1. No real Presentation 3 Manifest is served under the configured API origin, so
   `resolved.source === 'iiif'` cannot occur in production yet.
2. `/fragments/{number}/media` does not exist, so `media-endpoint` cannot occur
   either. `ApiMediaRepository` is complete and will start working the moment the
   route ships.
3. `mediaSummary` is still absent from `FragmentDto`, so
   `normalizeCompatibleMediaSummary` still has no production input.
4. No real `info.json` per Image Service (needed only for the OpenSeadragon pass).
5. Image API compliance level unknown, so `supportsArbitraryRegions` /
   `supportsArbitrarySizes` stay `undefined`.
6. No CORS headers on image endpoints; browser-accessible image requests are
   still unverified. Manifest and `info.json` are proxied through the eBL API
   path unauthenticated.

Until (1) and (2) land, every production resolution returns `legacy-photo` or
`none` — which is exactly the behaviour-preserving outcome this pass targeted.

## 30. Exact next frontend implementation step

**Add the OpenSeadragon renderer behind the existing `ImageRenderer` contract,
gated on `resolved.source === 'iiif'`, once §29 items 1, 4, 5 and 6 clear.**

In order:

1. Wait for a real Manifest under the API origin. Confirm end to end that
   `resolveMedia` returns `source: 'iiif'` for a beta session by reading the
   `data-media-source` attribute already wired in this pass — no new
   instrumentation needed.
2. Call `findImageInfo` for the primary media's Image Service, through the
   already-built `IiifCache.imageInfo` map, and only on the detail view.
3. Implement `OpenSeadragonImageViewer` satisfying `ImageRendererProps`
   (`imageUrl`, `alt`, `renderToolbar`), mapping the toolbar's
   `zoomIn`/`zoomOut`/`reset` onto the OpenSeadragon viewport so the shared
   toolbar, download and open-in-new-tab keep working unchanged.
4. Select it in `Images.tsx` with
   `renderer={resolved.source === 'iiif' && hasImageService(media) ? OpenSeadragonImageViewer : undefined}`,
   leaving `StaticImageViewer` as the default for every other source.
5. Keep the legacy Blob path as the fallback for the whole rollout.

Step 4 is a one-line change precisely because this pass resolved the source
without touching the viewer.

The `media-endpoint` branch should stay unrendered until the backend ships both
`mediaSummary` on the fragment DTO and the `/fragments/{number}/media` route.

## 31. Final `git status`

```
On branch iiif
Your branch is up to date with 'origin/iiif'.
```

36 porcelain entries: 0 staged, 8 unstaged tracked modifications
(`craco.config.js` pre-existing, plus the 7 production/test files modified by
this pass), and 43 untracked paths (the 14 files created by this pass, the 2 new
task tracking files, this handoff, and the 26 pre-existing untracked
`docs/`/`TASK-*`/`PR_*` files).

`git diff --check` clean. No conflict markers anywhere in `src/` or `docs/`.
HEAD still `76932a245b48323b450ecb6743ad31dcac878317`.

## 32. Confirmations

- **No full test suite.** `yarn test --watchAll=false` was never run. Only
  focused `--testPathPattern` invocations executed, covering 80 suites.
- **No commit.** HEAD is unchanged at `76932a24`. `git commit` was never run.
- **No push.** `git push` was never run. No network Git operation was performed —
  no fetch, pull, clone, merge, rebase, cherry-pick, reset, clean or stash. The
  branch remained `iiif` throughout.
- **No deployment.** Nothing was deployed.
- **No production access.** No production system, credential, service or endpoint
  was accessed.
- **No dependency installation.** `package.json` and `yarn.lock` are
  byte-unchanged. No package was installed or upgraded. No OpenSeadragon, no
  Mirador, no state-management library.
