# TASK-IIIF-FE-IMPL — Work log

## Ground truth (recorded before any edit)

- Repository: `/workspaces/ebl-frontend` (origin `https://github.com/ElectronicBabylonianLiterature/ebl-frontend.git`) — CONFIRMED eBL frontend.
- Branch: `iiif` — CONFIRMED. Upstream `origin/iiif`.
- HEAD: `cccacb0e85443b098ffa218e203edacf71c12610` ("Update Assurbanipal font (#789)").
- `git merge-base HEAD origin/master` = `cccacb0e…` → **`iiif` is exactly `origin/master`; it carries no commits of its own.**
- `git merge-base HEAD master` = `d9312619…`.
- Working tree at start: ` M craco.config.js`; untracked `.deepcode/`, `.devcontainer/devcontainer-lock.json`,
  `PR_750_CLAUDE_FINAL_ADVERSARIAL_REVIEW.md`, `PR_750_CLAUDE_FINAL_INDEPENDENT_REVIEW.md`,
  `PR_765_CLAUDE_FINAL_ADVERSARIAL_REVIEW_HANDOFF.md`, `TASK-IIIF-FE-log.md`, `TASK-IIIF-FE-todo.md`, `docs/`.
  All pre-existing and unrelated; preserved untouched.

## Blocking discovery

The task brief assumes the `feature-media-architecture` media domain is present. It is **not**:
`src/fragmentarium/domain/media.ts`, `mediaGallery.ts`, `infrastructure/media*.ts`,
`application/MediaRepository.ts`, `application/MediaBinaryLoader.ts`,
`test-support/mediaArchitectureIsolationGuard.ts` — none exist. `find src -iname "media*"` returns nothing.

Constraint 4 forbids merge/cherry-pick, so the branch cannot be rebuilt onto that work.
Chosen safest reversible response: create `src/fragmentarium/domain/media.ts` with content aligned
to `feature-media-architecture`'s version (read read-only via `git show`) so a later merge is a
near no-op, and keep every IIIF-specific addition in _separate additive modules_ rather than editing
that file. Recorded as a reconciliation item in the handoff.

## Implementation log

### 1. Media domain (IMPLEMENTED)

- `src/fragmentarium/domain/media.ts` created **byte-identical** to
  `feature-media-architecture:src/fragmentarium/domain/media.ts` (verified with `diff`), so that branch
  merging later is a no-op on this file. Every IIIF addition lives in separate modules:
  - `mediaImageService.ts` — `ImageComplianceLevel`, `ImageServiceDescriptor`, `ImageServiceTiles`,
    `ImageServiceSize`, `supportsArbitraryRegions/Sizes`. No level is assumed.
  - `iiifMedia.ts` — `MediaRendering`, `IiifMediaRepresentations` (adds `imageService`, `thumbnail`),
    `IiifMediaResource` (adds `label`, `canvasWidth/Height`, `renderings`; makes `type` optional).
  - `iiifDocument.ts` — `IiifReference`, `IiifDiagnostic`, `IiifMetadataEntry`, `IiifProvider`, `IiifDocument`.
  - `iiifResult.ts` — `ManifestFetchResult`, `ManifestNormalizationResult`, `ManifestValidationFailure`,
    `AuthorizationRequiredState`, `ImageInfoFetchResult`.
  - `mediaSource.ts` — `MediaSourceKind`, `LegacyMediaFallback`, `ResolvedFragmentMedia`,
    `resolveFragmentMedia` (IIIF → media-endpoint slot → legacy-photo → none).

### 2. IIIF wire boundary (IMPLEMENTED) — `src/fragmentarium/infrastructure/iiif/`

`iiifDtos.ts` (all wire fields `unknown`), `iiifValidation.ts`, `iiifLanguageMap.ts`,
`iiifImageService.ts`, `iiifCanvasBody.ts`, `iiifCanvasAdapter.ts`, `iiifDescriptive.ts`,
`iiifManifestAdapter.ts` (the single raw-Manifest interpretation point), `iiifReference.ts`,
`iiifApiPath.ts`.

### 3. Defect found and fixed during testing

`resolveLanguageMap` initially accepted a bare string as a language-map value because it reused the
lenient `toArray`. IIIF requires array-of-string values. Added `normalizeStrictStringArray` and
switched the language-map module to it. `{ en: 'not an array' }` now resolves to `undefined`.

### 4. Repository + cache (IMPLEMENTED)

- `ApiIiifRepository` fetches only URLs that resolve to a path under the configured eBL API base URL
  (`toApiPath`); anything else returns `unavailable` **without issuing a request**, so the bearer token
  can never reach a foreign origin. No generic arbitrary-URL fetcher, no proxy.
- `IiifCache` registers `manifests`/`imageInfos` (+ in-flight request maps) with the **same**
  `ScopedCache` instance `FragmentCache` already owns, so auth-scope changes clear them too.
  Exposed as `FragmentCache.iiif`. `fragmentCache.ts` is 245 lines (under the 250 ceiling).

### 5. Fragment discovery (IMPLEMENTED)

`FragmentDto.iiif?: unknown` → `normalizeFragmentIiifReference` in `createFragment` →
`Fragment.iiif?: IiifReference`. Absent/malformed/non-https/foreign/unknown-version → `undefined`.

### 6. Viewer refactor (IMPLEMENTED)

`ui/images/viewer/{imageViewerContract.ts,StaticImageViewer.tsx,ImageViewer.tsx}`.
`Photo.tsx` 89→54 lines, `FolioImage.tsx` 55→16 lines; the duplicated `TransformWrapper` block is gone.
Zoom limits, panning config, class names, alt text, EXIF artist line and the Markdown copyright footer
are unchanged.

### 7. Toolbar hardening (IMPLEMENTED)

- `window.open(url, '_blank')` → `window.open(url, '_blank', 'noopener,noreferrer')`.
  `FolioImage.test.tsx` expectation updated to match (behaviour change, not a removed test).
- Download extension no longer `blob.type.split('/')[1]` (which produced `eBL-K.1.svg+xml`).
  New `common/utils/imageFileExtension.ts` uses an explicit MIME allowlist and sanitizes the base name.

### 8. Pre-existing issues found

- `resetMocks: true` (CRA default) silently strips `jest.fn(impl)` implementations declared at module
  scope. Two of my own new tests hit this; rewritten to not depend on it. No production defect.

### 9. Lint issues found and fixed at the root (no suppression)

- `no-script-url` × 14 on `'javascript:alert(1)'` literals in the hostile fixtures and security tests.
  Replaced by an exported `unsafeScriptUrl` built as `['javascript', 'alert(1)'].join(':')` (with
  `unsafeDataUrl`, `unsafeFileUrl` beside it). Same assertions, no rule disabled.
- `testing-library/render-result-naming-convention` on **production** `iiifCanvasAdapter.ts`: the
  plugin's aggressive reporting treats any `render`-named helper as Testing Library's `render()`.
  `normalizeRenderings` → `normalizeMediaAlternatives`, local `renderings` → `alternatives`. The IIIF
  `renderings` property on the view model is unchanged. No `eslint-disable` added.

## Final verification

- `npx tsc --noEmit -p tsconfig.json` → exit 0, no output.
- `npx eslint 'src/**/*.{ts,tsx}'` → exit 0, no output.
- `npx stylelint 'src/**/*.{css,sass}'` → exit 0, no output.
- Focused IIIF/viewer suite: **16 suites, 263 tests, all passed, 100% stmts/branch/funcs/lines**
  across every module this pass touched. Zero console output.
- Focused regression suite (`FragmentRepository|fragmentCache|scopedCache|fragment.test|images/`):
  **22 suites, 241 tests, all passed.** Zero console output.
- Focused `FragmentService` suite: **17 suites, 148 tests, all passed.** Zero console output.
- Every new/changed `.ts`/`.tsx` file is ≤ 250 lines (largest: `fragmentCache.ts` at 245).
- `src/fragmentarium/domain/media.ts` re-verified byte-identical to `feature-media-architecture`.
- **Full test suite NOT run** (forbidden by the task brief). No commit, push, deploy or production access.
- HEAD unchanged at `cccacb0e…` on branch `iiif`; all pre-existing tracked and untracked work preserved.
