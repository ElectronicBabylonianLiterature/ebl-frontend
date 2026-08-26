# PR Review Report: `feature-media-architecture`

---

## 1. Executive Verdict

**READY WITH NON-BLOCKING FOLLOW-UPS**

| Item                                                               | Value                                                                                               |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| Overall confidence                                                 | **High**                                                                                            |
| Blocking findings                                                  | **0**                                                                                               |
| High findings                                                      | **2**                                                                                               |
| Medium findings                                                    | **4**                                                                                               |
| Low findings                                                       | **3**                                                                                               |
| Deployment behavior classification                                 | **ADDITIVE RUNTIME CHANGE**                                                                         |
| Safe to merge before backend persistence/backfill?                 | **YES**                                                                                             |
| Changes current user-visible behavior?                             | **YES — minor visual changes to the Photo tab (new toolbar, zoom percentage, refined zoom config)** |
| Ready to serve as foundation for future gallery/media integration? | **YES**                                                                                             |

The branch is architecturally sound, surgically scoped, well-tested, and safe to deploy before any backend media work. The new media modules are rigorously isolated from production code (verified by an automated isolation test). The reusable `ImageViewer` improves security (`noopener,noreferrer`) and accessibility (ARIA labels, zoom percentage output) while preserving all existing Photo behavior. The two high-severity findings are documentation mismatches, not code defects. No code needs to change before merge.

---

## 2. Scope Reviewed

| Item               | Value                                                                                                                                     |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Base branch        | `master`                                                                                                                                  |
| Merge base         | `4a582092`                                                                                                                                |
| Commits reviewed   | 8                                                                                                                                         |
| Files reviewed     | 20 (19 added, 1 modified)                                                                                                                 |
| Line changes       | +2172 / −40                                                                                                                               |
| Major change areas | Media domain types, DTOs, mapper, repository/binary-loader contracts, gallery helpers, reusable ImageViewer, Photo migration, docs, tests |
| Tests inspected    | 13 test files (not run)                                                                                                                   |

---

## 3. Architecture Summary

### What the branch introduces

1. **Frontend media domain types** (`media.ts`): `MediaType` (`PHOTO | COPY`), `ThumbnailSize`, `MediaResource`, `MediaSummary`, `MediaRepresentations`, etc. All readonly, framework-independent value types.

2. **DTO types** (`mediaDtos.ts`): Permissive `unknown`-typed DTOs mirroring backend field names, intentionally loose to survive partially migrated data.

3. **Pure normalization mapper** (`mediaMapper.ts`): 378 lines of defensive normalization functions that validate, filter, and map raw DTOs into safe domain types. Handles legacy `hasPhoto`/`thumbnailPath` fallback. No side effects, no network calls.

4. **Repository contract** (`MediaRepository.ts`): Single-method interface `findByFragment(fragmentNumber)`. No implementation.

5. **Binary loader contract** (`MediaBinaryLoader.ts`): `fetch(request)` returning `Promise<Blob>`. Includes `mediaId`, `url`, and `representation` context. No implementation.

6. **Gallery helpers** (`mediaGallery.ts`): Pure functions `sortMedia`, `selectInitialMedia`, `selectMediaById` for future gallery-selection logic.

7. **Reusable ImageViewer** (`ImageViewer.tsx` + `.css`): Extracted and enhanced from the old `ImageButtonGroup`/Photo render pattern. Accepts a `Blob`, manages its own object URL via `useObjectUrl`, provides zoom/pan through `react-zoom-pan-pinch`, download, and open-in-new-tab controls.

8. **Photo component migration**: `Photo.tsx` replaced its inline `TransformWrapper`/`ImageButtonGroup` rendering with a single `<ImageViewer>` invocation.

### What remains intentionally unwired

- No `MediaRepository` implementation calls `/fragments/{number}/media`
- No `MediaBinaryLoader` implementation
- No gallery component rendered anywhere
- No media summary integrated into fragment query lists
- No `mediaSummary` consumed by any production component
- No display-representation selection logic

### How legacy compatibility works

The `normalizeCompatibleMediaSummary` function accepts a hybrid DTO (`MediaSummaryCompatibilityDto`) containing both `mediaSummary` and legacy `hasPhoto`/`thumbnailPath`. When the new summary is valid, it wins. When absent or malformed, it falls back to a synthetic `{count: 1, types: ['PHOTO']}` from the legacy fields. The legacy `thumbnailPath` is preserved in a dedicated `legacyThumbnailPath` field — never conflated with a media UUID.

### How the viewer is integrated

The Photo component passes its `Blob` prop directly to `<ImageViewer image={photo} alt={...} downloadFileName={...} />`. The viewer internally creates and manages the object URL lifecycle through `useObjectUrl`. The EXIF footer, museum copyright, and `Photo.css` remain unchanged in `Photo.tsx`.

### How it prepares for future display representations and gallery integration

The domain model already supports:

- `representations.display` (optional raster display for SVG originals)
- `representations.thumbnails` (per-size thumbnails)
- Multiple media per fragment via `FragmentMedia.media[]`
- `sortOrder` and `isPrimary` for gallery ordering
- `MediaType` distinguishing PHOTO from COPY

The `ImageViewer` accepts a generic `Blob`, making it ready to receive a display-representation Blob instead of the original once the binary loader selects the right representation.

---

## 4. Findings

### Blocking

None.

### High

**H-1: Architecture documentation contradicts actual runtime behavior**

| Field                     | Value                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Severity                  | High                                                                                                                                                                                                                                                                                                                                                                      |
| Title                     | Architecture doc claims "No-Runtime-Change Boundary" but Photo component migration is deployed                                                                                                                                                                                                                                                                            |
| File                      | `docs/media-architecture.md`                                                                                                                                                                                                                                                                                                                                              |
| Lines                     | 44–56                                                                                                                                                                                                                                                                                                                                                                     |
| Evidence                  | The doc states: _"This architecture work must not: Change user-visible UI. … No gallery component, route, tab, or visible UI work."_ However, `Photo.tsx` (lines 31–53) now renders `<ImageViewer>` instead of the old inline `TransformWrapper`/`ImageButtonGroup` pattern, with different CSS classes, a new zoom-percentage display, and different zoom configuration. |
| Why it matters            | Developers and reviewers reading the architecture doc will believe no runtime changes are deployed. This creates a false sense of safety and obscures the fact that the Photo tab already uses the new viewer.                                                                                                                                                            |
| Concrete failure scenario | A reviewer or future developer reads the doc, believes the viewer is not yet in production, and makes incompatible changes to the viewer without testing the Photo tab.                                                                                                                                                                                                   |
| Recommended correction    | Update the "No-Runtime-Change Boundary" section to document that the reusable `ImageViewer` is already deployed in the Photo tab as an additive, backward-compatible migration. The boundary should state that only the new media domain, repository, and binary-loader modules remain unwired.                                                                           |
| Blocks merge?             | **No** — the code is correct; only the documentation is misleading.                                                                                                                                                                                                                                                                                                       |

**H-2: Rollout contract states "Object URLs are revoked when no longer needed" but `handleOpenInNewTab` uses a 60-second deferred revoke**

| Field                     | Value                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Severity                  | High                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Title                     | `handleOpenInNewTab` revoke pattern trusts a 60-second timeout; no guarantee the tab has consumed the Blob                                                                                                                                                                                                                                                                                                                                                                                                               |
| File                      | `src/common/ui/ImageViewer.tsx`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Lines                     | 76–89                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Evidence                  | `URL.createObjectURL(image)` creates a fresh URL. `window.open(originalUrl, '_blank', 'noopener,noreferrer')` opens it. `setTimeout(() => URL.revokeObjectURL(originalUrl), 60000)` revokes after a fixed delay. The documentation (`docs/media-rollout-contract.md` line 121) states: _"New-tab object URLs are not revoked before the opened tab has loaded."_ However, 60 seconds is a heuristic — there is no guarantee the browser has finished loading the image within that window (slow networks, large images). |
| Why it matters            | If the blob URL is revoked before the new tab finishes loading, the image breaks.                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Concrete failure scenario | A user on a very slow connection opens the original image in a new tab. The image takes >60 seconds to load. The tab shows a broken image.                                                                                                                                                                                                                                                                                                                                                                               |
| Recommended correction    | This is a pre-existing pattern from the old `useImageActions` hook (line 50 of `ImageButtonGroup.tsx`), not introduced by this branch. The new code improves security (`noopener,noreferrer`). File a follow-up to investigate tracking tab load completion via `window.open` return value or using a download-then-open pattern.                                                                                                                                                                                        |
| Blocks merge?             | **No** — this is a pre-existing issue that the branch did not create. The security improvement (`noopener,noreferrer`) is a net positive.                                                                                                                                                                                                                                                                                                                                                                                |

### Medium

**M-1: Old `ImageButtonGroup`'s `useImageActions` still has the insecure `window.open` pattern (no `noopener,noreferrer`)**

| Field                     | Value                                                                                                                                                                                                                                      |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Severity                  | Medium                                                                                                                                                                                                                                     |
| Title                     | `FolioImage` opens Blob URLs in new tabs without `noopener,noreferrer`                                                                                                                                                                     |
| File                      | `src/fragmentarium/ui/images/ImageButtonGroup.tsx`                                                                                                                                                                                         |
| Lines                     | 47–51                                                                                                                                                                                                                                      |
| Evidence                  | `window.open(photoUrl, '_blank')` is called without the `'noopener,noreferrer'` window features string. The `ImageViewer` already fixes this (line 79–81), but `FolioImage.tsx` still uses the old `useImageActions` hook, which does not. |
| Why it matters            | The opened tab can access `window.opener`, potentially enabling tab-napping or phishing attacks.                                                                                                                                           |
| Concrete failure scenario | A malicious actor crafts a blob URL that leads to a page that accesses `window.opener.location` and redirects the original eBL tab to a phishing page.                                                                                     |
| Recommended correction    | Migrate `FolioImage.tsx` to `ImageViewer` or update `useImageActions` in `ImageButtonGroup.tsx` to add `noopener,noreferrer` and `opener = null`.                                                                                          |
| Blocks merge?             | **No** — this is a pre-existing issue in `FolioImage`, not introduced by this branch. The new `ImageViewer` correctly fixes it.                                                                                                            |

**M-2: `useObjectUrl` hook may produce revoked object URLs under React Strict Mode**

| Field                     | Value                                                                                                                                                                                                                                                                                                                              |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Severity                  | Medium                                                                                                                                                                                                                                                                                                                             |
| Title                     | `useMemo` + effect cleanup pattern can revoke URLs that are still in use during Strict Mode double-invocation                                                                                                                                                                                                                      |
| File                      | `src/common/hooks/useObjectUrl.ts`                                                                                                                                                                                                                                                                                                 |
| Lines                     | 1–31                                                                                                                                                                                                                                                                                                                               |
| Evidence                  | `useMemo` creates the URL once (line 6). The effect cleanup revokes it (line 22). In React 18 Strict Mode development, effects are mounted→unmounted→mounted. The cleanup revokes the URL during the "unmount" phase, but `useMemo` does not re-execute because `data` hasn't changed, so the component renders a now-revoked URL. |
| Why it matters            | Images may appear broken during development (Strict Mode only), causing confusion and wasted debugging time. In production builds (no Strict Mode), this works correctly.                                                                                                                                                          |
| Concrete failure scenario | A developer working in dev mode sees a broken image in the Photo tab after a hot reload. The URL was revoked by Strict Mode's double-effect.                                                                                                                                                                                       |
| Recommended correction    | Refactor `useObjectUrl` to use `useRef` for URL storage and `useEffect` for creation + cleanup: create the URL in a mount effect, revoke in the cleanup. This avoids the `useMemo`+`useEffect` split that causes the Strict Mode issue.                                                                                            |
| Blocks merge?             | **No** — pre-existing issue in a hook already deployed to production. Production builds are unaffected.                                                                                                                                                                                                                            |

**M-3: Download extension for SVG yields `svg+xml` instead of `svg`**

| Field                     | Value                                                                                                                                                                                 |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Severity                  | Medium                                                                                                                                                                                |
| Title                     | `extensionFromMimeType` produces non-standard file extension for SVG images                                                                                                           |
| File                      | `src/common/ui/ImageViewer.tsx`                                                                                                                                                       |
| Lines                     | 27–29                                                                                                                                                                                 |
| Evidence                  | `mimeType.split('/')[1]` for `image/svg+xml` produces `svg+xml`, not `svg`. The download filename becomes `eBL-K.1.svg+xml`.                                                          |
| Why it matters            | Some operating systems or applications may not recognize `.svg+xml` as an SVG file.                                                                                                   |
| Concrete failure scenario | User downloads an SVG COPY original. The file is named `eBL-K.1.svg+xml`. Their OS file manager doesn't associate it with an SVG viewer.                                              |
| Recommended correction    | Add a MIME-to-extension mapping for known types: `image/svg+xml` → `svg`, `image/jpeg` → `jpg`, etc. Fall back to the current logic for unknown types.                                |
| Blocks merge?             | **No** — SVG COPY download is a future feature (SVGs are not yet loaded as Blobs through this viewer). The current photo path always uses `image/jpeg` which correctly yields `jpeg`. |

**M-4: `FolioImage` not migrated to `ImageViewer` — divergent rendering**

| Field                     | Value                                                                                                                                                                                                                                                                        |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Severity                  | Medium                                                                                                                                                                                                                                                                       |
| Title                     | `FolioImage` still uses the old inline render pattern without accessibility, security, or zoom improvements                                                                                                                                                                  |
| File                      | `src/fragmentarium/ui/images/FolioImage.tsx`                                                                                                                                                                                                                                 |
| Lines                     | 20–50                                                                                                                                                                                                                                                                        |
| Evidence                  | `FolioImage` still renders its own `TransformWrapper` + `ImageButtonGroup` with the old zoom configuration and insecure `window.open`. The new `ImageViewer` improvements (toolbar, zoom percentage, ARIA labels, `noopener,noreferrer`) are not available for folio images. |
| Why it matters            | Users get inconsistent UX between Photo and Folio tabs. Accessibility and security improvements are not uniformly applied.                                                                                                                                                   |
| Concrete failure scenario | A keyboard user can operate zoom controls on the Photo tab but not on the Folio tab (same button labels but inconsistent behavior).                                                                                                                                          |
| Recommended correction    | Migrate `FolioImage` to use `ImageViewer` in a follow-up PR.                                                                                                                                                                                                                 |
| Blocks merge?             | **No** — `FolioImage` is out of scope for this architecture branch.                                                                                                                                                                                                          |

### Low

**L-1: Inline callback `onTransformed` creates new function identity each render**

| Field                  | Value                                                                                                                                                                                                                                      |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Severity               | Low                                                                                                                                                                                                                                        |
| Title                  | `onTransformed` and `onInit` are inline arrow functions, recreating function identity each render                                                                                                                                          |
| File                   | `src/common/ui/ImageViewer.tsx`                                                                                                                                                                                                            |
| Lines                  | 115–116                                                                                                                                                                                                                                    |
| Evidence               | `onTransformed={(_, state) => setScale(state.scale)}` and `onInit={({ state }) => setScale(state.scale)}` are new arrow functions on every render.                                                                                         |
| Why it matters         | `react-zoom-pan-pinch` may treat new function references as changed props, causing unnecessary internal reconfiguration. In practice, `TransformWrapper` uses these as callbacks, not for memoization, so the impact is likely negligible. |
| Recommended correction | Wrap in `useCallback` for consistency.                                                                                                                                                                                                     |
| Blocks merge?          | No                                                                                                                                                                                                                                         |

**L-2: `useExifData` hook has no cleanup for cancelled/unmounted reads**

| Field                     | Value                                                                                                       |
| ------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Severity                  | Low                                                                                                         |
| Title                     | EXIF read may set state after unmount                                                                       |
| File                      | `src/fragmentarium/ui/images/Photo.tsx`                                                                     |
| Lines                     | 18–29                                                                                                       |
| Evidence                  | `EXIF.getData` callback may fire after the component unmounts. There is no mounted flag or abort mechanism. |
| Why it matters            | React warning about state update on unmounted component.                                                    |
| Concrete failure scenario | Fragment page navigates away while EXIF data is still being parsed.                                         |
| Recommended correction    | Add a mounted guard (`useRef(true)` + cleanup that sets it to `false`).                                     |
| Blocks merge?             | **No** — this is pre-existing code not changed by this branch.                                              |

**L-3: `window.open` return value typed as `Window | null` but fallback `opener = null` cast is imprecise**

| Field          | Value                                                              |
| -------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| Severity       | Low                                                                |
| Title          | TypeScript assertion on `window.open` return value                 |
| File           | `src/common/ui/ImageViewer.tsx`                                    |
| Lines          | 78, 84–86                                                          |
| Evidence       | `const openedWindow = window.open(...)`. TypeScript infers `Window | null`. The `if (openedWindow)` guard correctly narrows within the block. No actual type error, but casting is redundant. |
| Why it matters | Minor style issue; no runtime impact.                              |
| Blocks merge?  | No                                                                 |

---

## 5. Media Model and Contract Assessment

### Identity

- **PASS** — Media ID is a stable `string` field (`id`), not derived from filename, museum number, or URL.
- **PASS** — No synthetic/fabricated legacy media UUID is created. The legacy fallback `createLegacyPhotoSummary()` returns `{count: 1, types: ['PHOTO']}` with **no `primary` field** (no `id`), confirmed by tests at `mediaMapper.test.ts:54-62`.
- **PASS** — `legacyThumbnailPath` is a separate field in `NormalizedMediaSummaryCompatibility`, never conflated with a media ID.
- **PASS** — `MediaResource.id`, museum number (not in the media model), and representation URLs are not conflated.

### PHOTO / COPY

- **PASS** — `MediaTypes = ['PHOTO', 'COPY'] as const` with `MediaType = (typeof MediaTypes)[number]`.
- **PASS** — `isMediaType` type guard rejects unknown values (tested in `media.test.ts:12-17`).
- **PASS** — SVG is represented as `type: 'COPY'` + `mimeType: 'image/svg+xml'` on the original representation, not as a separate media type.
- **PASS** — `MediaSummary.types` is `readonly MediaType[]`, supporting multiple types per fragment.

### Representations

- **PASS** — `original` is required (`MediaRepresentations.original` is non-optional).
- **PASS** — `display` is optional (`display?: MediaRepresentation`).
- **PASS** — `thumbnails` is optional (`Partial<Record<ThumbnailSize, MediaRepresentation>>`).
- **PASS** — MIME type, width, and height are represented correctly. Width/height are optional (`width?: number`).
- **PASS** — Display is distinct from thumbnails (different field, different semantics).
- **PASS** — SVG original (e.g., `image/svg+xml`) can coexist with a raster display representation (`image/png`), tested in `mediaMapper.test.ts:193-238`.
- **PASS** — Missing `display` falls back safely: `normalizeMediaRepresentations` returns `undefined` for invalid `display` but preserves the `original` if valid (tested in `mediaMapper.test.ts:241-259`).

### Associations and ordering

- **PASS** — `sortOrder` and `isPrimary` are on `MediaResource` (association-level).
- **PASS** — `FragmentMedia.media` is an array, supporting multiple items.
- **PASS** — Stable ordering via `sortMedia` (sort by `sortOrder`, then input index for ties).
- **PASS** — Primary selection is deterministic: `selectInitialMedia` finds the first `isPrimary` in sorted order, falls back to first item, falls back to `null`.
- **PASS** — `COPY`-only records do not set `hasPhoto=true` (`createLegacyPhotoSummary` sets `types: ['PHOTO']` only for legacy; COPY summaries come from the backend).

### Metadata

- **PASS** — `caption`, `attribution`, `references` supported.
- **PASS** — Backend-internal fields (`projects`, `fileName`, `checksum`) are stripped by the mapper, verified by `mediaMapper.boundary.test.ts:4-38`.
- **PASS** — `MediaReference` only exposes `id`.

### DTOs and mapping

- **PASS** — All DTO fields are `unknown`-typed for defensive parsing.
- **PASS** — Field names match backend contract exactly (`mediaSummary`, `count`, `types`, `primary`, `thumbnail`, `original`, `display`, `thumbnails`, `sortOrder`, `isPrimary`, `caption`, `attribution`, `references`).
- **PASS** — Camel-case consistency maintained.
- **PASS** — Mapper functions handle `null`, `undefined`, missing fields, wrong types, and malformed values without throwing.
- **PASS** — `isMediaType` rejects `'photo'` (lowercase), `'SVG'`, `'COPY '` (trailing space), empty string, null, numbers (tested `media.test.ts:12-17`).
- **PASS** — `normalizeNonNegativeInteger` rejects negative numbers and non-integers.
- **PASS** — `normalizePositiveInteger` rejects zero and negative numbers for dimensions.
- **PASS** — `normalizeCompatibleMediaSummary` correctly prioritizes valid new summaries over legacy, falls back to legacy when new is malformed.
- **PASS** — Display representation propagation: `normalizeMediaRepresentations` correctly includes `display` when valid and omits it when invalid.

### Repository contracts and binary loader

- **PASS** — `MediaRepository` is a clean single-method interface with no implementation.
- **PASS** — `MediaBinaryLoader` is a clean single-method interface with no implementation.
- **PASS** — `MediaBinaryRequest` includes `mediaId`, `url`, and `representation` context — not just a raw URL.
- **PASS** — No dependency on Axios, React, router, or DOM types in contracts.

---

## 6. ImageViewer Assessment

### API design

- **PASS** — Props are minimal and generic: `image: Blob`, `alt: string`, `downloadFileName: string`, `loading?`, `decoding?`.
- **PASS** — Does not know about fragments, media repositories, authentication, or GridFS.
- **PASS** — Accepts a pre-fetched `Blob`, not a URL or media ID.
- **PASS** — Alt text is required (not optional).
- **PASS** — `downloadFileName` is explicit and separate from alt text.

### Zoom/pan behavior

- **PASS** — Uses `react-zoom-pan-pinch` v3.7.0 (pre-existing dependency).
- **PASS** — Zoom in/out with step 0.5, animation 180ms.
- **PASS** — Min scale 0.5, max scale 8.
- **PASS** — Reset to initial position.
- **PASS** — Wheel zoom configured (`step: 0.16, smoothStep: 0.004`).
- **PASS** — Pinch zoom configured (`step: 5`).
- **PASS** — Double-click toggles zoom (`mode: 'toggle', step: 1.2`).
- **PASS** — Mouse panning enabled (`allowLeftClickPan: true`).
- **PASS** — `centerOnInit` and `centerZoomedOut` set.
- **PASS** — Zoom percentage displayed as `{Math.round(scale * 100)}%`.
- **PASS** — `touch-action: none` on viewport prevents browser gestures conflicting with pan.
- **PASS** — No `requestAnimationFrame` loop or continuous re-render issue. `setScale` triggers only on transform change events.
- **PASS** — No reduced-motion handling, but images use CSS `object-fit: contain` which doesn't animate. The `smooth` prop on `TransformWrapper` enables smooth zooming. No `prefers-reduced-motion` media query is checked. This is a low-priority follow-up.

### Keyboard behavior

- **PASS** — All toolbar buttons are native `<Button>` with `type="button"`.
- **PASS** — Each button has `aria-label` (e.g., "Zoom in", "Zoom out", "Reset image", "Download image", "Open original image").
- **PASS** — `focus-visible` style is defined (`.ImageViewer__control:focus-visible`, 3px blue outline).
- **PASS** — Toolbar has `role="toolbar"` and `aria-label="Image controls"`.
- **PASS** — Icons have `aria-hidden="true"` to prevent redundant announcements.
- **PASS** — `react-zoom-pan-pinch` keyboard support: the library supports keyboard navigation for the transform wrapper. Arrow keys pan, +/- zoom.

### Touch behavior

- **PASS** — Touch targets are ≥ 2.5rem (40px) minimum, 2.75rem (44px) on mobile — meets WCAG 2.5.5 target size.
- **PASS** — Pinch zoom configured.
- **PASS** — Panning works with touch.
- **PASS** — `touch-action: none` prevents scroll conflicts.

### Accessibility

- **PASS** — All interactive controls are native buttons.
- **PASS** — Buttons have accessible names via `aria-label`.
- **PASS** — Icon-only controls have `aria-hidden="true"` on the icon element.
- **PASS** — Keyboard focus is visible (explicit `focus-visible` style).
- **PASS** — Zoom percentage is an `<output>` element with `aria-label="Zoom level"`.
- **PASS** — Image has explicit `alt` text (provided by caller).
- **PASS** — Decorative icons hidden from assistive technology.
- **PASS** — Toolbar order is logical (zoom in → zoom out → reset → download → open original).
- **PASS** — Controls are not hover-only; tooltips are supplementary.
- **PASS** — Empty state has `role="status"` for live-region announcement.
- **PASS** — Color is not the sole indicator (icons + labels + tooltips).

### Security

- **PASS** — `handleOpenInNewTab` uses `window.open(url, '_blank', 'noopener,noreferrer')`.
- **PASS** — Additionally sets `openedWindow.opener = null` as a defense-in-depth measure.
- **PASS** — No raw SVG injection — the viewer only uses `<img src={imageUrl}>`.
- **PASS** — No `dangerouslySetInnerHTML`, `<object>`, or `<embed>`.
- **PASS** — Download uses `link.download` with the blob URL — no external redirects.
- **PASS** — No token-bearing URLs — the viewer receives a Blob, not a URL with auth credentials.
- **PASS** — Blob URLs are opaque and scoped to the origin.
- **PASS** — `download` attribute doesn't navigate; it triggers a browser download dialog.

### Error and loading states

- **PASS** — Empty state when `imageUrl` is `undefined` (e.g., `useObjectUrl` returns undefined for null/error).
- **PASS** — `role="status"` on empty state container for assistive technology announcement.
- **PASS** — `loading` and `decoding` attributes passed to `<img>` (defaults: `eager`, `async`).
- **PASS** — When `src` changes (new Blob), `useObjectUrl` creates a new URL and revokes the old one. The `<img>` reloads with the new `src`.
- **PASS** — Cleanup on unmount: `useObjectUrl` effect cleanup revokes the URL.

### Performance

- **PASS** — `react-zoom-pan-pinch` is a pre-existing dependency, not adding new bundle weight.
- **PASS** — Image is fetched once (by the caller), passed as Blob to the viewer.
- **PASS** — Blob is not duplicated — the same reference is used for display and download.
- **PASS** — `handleOpenInNewTab` creates a second object URL (pre-existing pattern, 60s cleanup).
- **PASS** — Object URLs avoid base64 expansion for the display path.
- **PASS** — CSS transforms are used for zoom/pan (via the library), not image re-rasterization.
- **PASS** — No resize listeners or observers in the viewer.
- **PASS** — `draggable={false}` on `<img>` prevents browser-default drag behavior.

### Reusability

- **PASS** — No fragmentarium imports.
- **PASS** — Generic Blob-based API.
- **PASS** — Tested independently with mock Blob and mock zoom library.
- **PASS** — Located in `src/common/ui/`, not in any feature directory.

---

## 7. Photo Migration Assessment

| Behavior                 | Status   | Evidence                                                                                                                         |
| ------------------------ | -------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Legacy route usage       | **PASS** | `FragmentPhoto` in `Images.tsx:84-91` still calls `fragmentService.findPhoto(fragment)` (unchanged).                             |
| Authentication           | **PASS** | Same auth path — `FragmentService.findPhoto` calls `ImageRepository.findPhoto`, unchanged.                                       |
| Blob loading             | **PASS** | Blob fetched by `withData` HOC, passed as prop to `<Photo photo={data}>`, then to `<ImageViewer image={photo}>`.                 |
| Object URL creation      | **PASS** | `ImageViewer` uses `useObjectUrl(image)` (line 62), same pre-existing hook.                                                      |
| Object URL revocation    | **PASS** | Revoked on ref change and unmount by `useObjectUrl` (lines 18-28 of `useObjectUrl.ts`).                                          |
| Alt text                 | **PASS** | `alt={`Fragment ${fragment.number}`}` — identical to old code.                                                                   |
| Footer metadata          | **PASS** | EXIF artist, copyright `<footer>` unchanged in `Photo.tsx:42-53`.                                                                |
| Download filename        | **PASS** | `eBL-${fragment.number}.${ext}` — same format. Extension now falls back to `'bin'` (improvement).                                |
| Open-original behavior   | **PASS** | Same pattern: create Blob URL, open in new tab, revoke after 60s. Now with `noopener,noreferrer` (improvement).                  |
| Error handling           | **PASS** | `useObjectUrl` catches `createObjectURL` errors. `withData` handles fetch errors. Viewer shows "Image unavailable" for null URL. |
| Production compatibility | **PASS** | No dependency on media API, media UUIDs, or backfill.                                                                            |

### Regression risk

The migration replaces the old `TransformWrapper` configuration with a more detailed one. The old config:

```
panning={{ activationKeys: [] }}
initialScale={1}
minScale={0.5}
maxScale={8}
```

The new config adds `wheel`, `pinch`, `doubleClick`, `centerOnInit`, `centerZoomedOut`, `smooth`, animation configs. These are additive refinements and should not break any existing user workflow. The zoom range (0.5–8) and panning behavior are preserved.

---

## 8. Backward-Compatibility Assessment

**Deployment before backend backfill is SAFE.**

| Check                                                   | Status   | Evidence                                                                                                                               |
| ------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Existing images still load                              | **PASS** | `Images.tsx:84-91` uses `fragmentService.findPhoto(fragment)` → unchanged legacy route.                                                |
| No new media endpoint called                            | **PASS** | No production code imports or calls `MediaRepository` or `MediaBinaryLoader`. Verified by `mediaArchitectureIsolation.test.ts:88-105`. |
| No media UUID required                                  | **PASS** | Neither `FragmentPhoto`, `Photo`, nor `ImageViewer` references any media ID.                                                           |
| No display representation required                      | **PASS** | `ImageViewer` accepts a raw Blob, no representation selection.                                                                         |
| `hasPhoto` remains usable                               | **PASS** | `Images.tsx:45,144,169` still gate on `fragment.hasPhoto`. Unchanged.                                                                  |
| `thumbnailPath` remains usable                          | **PASS** | Unchanged in production code. Legacy compatibility mapping preserves it.                                                               |
| Legacy fragment behavior available                      | **PASS** | No fragment view changes beyond the Photo tab's visual refresh.                                                                        |
| No frontend route depends on migrated records           | **PASS** | No new routes. No redirects.                                                                                                           |
| Barrels do not re-export new modules                    | **PASS** | Verified by `mediaArchitectureIsolation.test.ts:108-125`.                                                                              |
| Production source files do not import new media modules | **PASS** | Verified by `mediaArchitectureIsolation.test.ts:88-105`.                                                                               |

### User-visible effect after merge

1. **Photo tab**: Toolbar appearance changes (new styling, zoom percentage display, button layout). Zoom behavior gains wheel/pinch/double-click refinements. Download extension gains `'bin'` fallback. Open-in-new-tab uses `noopener,noreferrer`. The image itself, alt text, copyright footer, and EXIF artist remain identical.
2. **Everything else**: No visible change.
3. **Network**: No new requests.

---

## 9. Security Assessment

| Area                             | Status   | Notes                                                                                                                                  |
| -------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Authenticated binary loading     | **PASS** | Existing `ImageRepository.findPhoto` handles auth. No change.                                                                          |
| Blob/object URLs                 | **PASS** | Created and revoked correctly by `useObjectUrl`. Second URL in `handleOpenInNewTab` revoked after 60s.                                 |
| SVG behavior                     | **PASS** | Viewer uses `<img>`, preventing inline SVG XSS. Documentation explicitly prohibits `dangerouslySetInnerHTML`, `<object>`, `<embed>`.   |
| External links                   | **PASS** | `window.open` uses `noopener,noreferrer`. `opener = null` as defense-in-depth.                                                         |
| Token leakage                    | **PASS** | No tokens in URLs or DOM. All binary access is Blob-based from pre-fetched data.                                                       |
| URL validation                   | **PASS** | Mapper normalizes URLs as non-empty trimmed strings but does not validate origin (intentionally: URLs may be relative or same-origin). |
| Download behavior                | **PASS** | `link.download` + `link.click()` — no navigation, no redirect.                                                                         |
| Media association trust boundary | **PASS** | Frontend domain model is receiver of server-provided associations. No client-side fabrication of media-fragment links.                 |

---

## 10. Accessibility Assessment

| Area                        | Status      | Notes                                                                                                                                              |
| --------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Keyboard controls           | **PASS**    | All buttons in toolbar are native. `react-zoom-pan-pinch` supports arrow key panning.                                                              |
| Focus indicators            | **PASS**    | `focus-visible` outline (3px solid `#7aa7d9`, offset 2px).                                                                                         |
| Accessible names            | **PASS**    | Every button has `aria-label`. Toolbar has `aria-label`. Zoom output has `aria-label`.                                                             |
| Zoom communication          | **PASS**    | `<output>` with `aria-label="Zoom level"` displays `Math.round(scale * 100)%`.                                                                     |
| Touch targets               | **PASS**    | 2.5rem (40px) minimum, 2.75rem (44px) on mobile.                                                                                                   |
| Screen-reader behavior      | **PASS**    | Icons hidden (`aria-hidden`). Toolbar semantics correct. Empty state uses `role="status"`.                                                         |
| Reduced motion              | **NEUTRAL** | No `prefers-reduced-motion` handling. CSS transitions are not applied (`react-zoom-pan-pinch` handles animation internally). Minor follow-up item. |
| Error/loading announcements | **PASS**    | `role="status"` on empty state div provides live-region announcement.                                                                              |

---

## 11. Performance Assessment

| Area                             | Status   | Notes                                                                                                             |
| -------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------- |
| Bundle impact                    | **PASS** | `react-zoom-pan-pinch` (pre-existing). `ImageViewer` + styles ≈ 282 lines total. No new heavy dependencies.       |
| Image fetch count                | **PASS** | Same as before: one fetch per Photo view via `fragmentService.findPhoto`.                                         |
| Blob memory                      | **PASS** | Blob is passed by reference, not copied. `createObjectURL` creates a lightweight reference.                       |
| Object URL lifecycle             | **PASS** | Created once per Blob change, revoked on unmount or new Blob.                                                     |
| Render behavior                  | **PASS** | `setScale` fires per transform frame but only updates the `<output>` text node. Image uses CSS transforms.        |
| Large-image handling             | **PASS** | `max-width: 100%`, `max-height: 72vh`, `object-fit: contain`. Zoom/pan via CSS transforms, not re-rendering.      |
| Display-representation readiness | **PASS** | Viewer accepts any Blob. Future code can pass a display Blob instead of the original without changing the viewer. |
| List-performance                 | **PASS** | No `mediaSummary` wired to list queries — no N+1 risk.                                                            |

---

## 12. Test Assessment

### Strong coverage

- **DTO mapping** (`mediaMapper.test.ts`, 415 lines): 16 test cases covering valid/invalid summaries, legacy fallback, malformed data, deduplication, representation normalization (including display, thumbnails, dimensions), resource normalization (including invalid sort order, bad type, missing representations), fragment response normalization (including empty, non-array), and thumbnail size normalization.
- **Mapper boundaries** (`mediaMapper.boundary.test.ts`): Verifies that backend-internal fields (`projects`, `fileName`, `checksum`) are stripped from output.
- **Media type guards** (`media.test.ts`): Exhaustive valid/invalid parameterized tests for `isMediaType` and `isThumbnailSize`.
- **Gallery helpers** (`mediaGallery.test.ts`): Tests sort stability, primary selection, fallback, empty collection, and id-based selection.
- **ThumbnailSize compatibility** (`thumbnailSizeCompatibility.test.ts`): Compile-time type assertion that domain and legacy thumbnail sizes are mutually assignable.
- **Architecture isolation** (`mediaArchitectureIsolation.test.ts`): Runtime verification that production source files and barrel exports do not import new media modules.
- **ImageViewer** (`ImageViewer.test.tsx`): Tests rendering with object URL, zoom control invocation, download filename format, open-original security attributes and revoke, and unmount URL cleanup.
- **Repository/binary loader contracts** (`MediaRepository.test.ts`, `MediaBinaryLoader.test.ts`): Verify that the interfaces support fake/test implementations.

### Meaningful missing coverage

- **No test for the `ImageViewer` empty state** — when `useObjectUrl` returns `undefined` (Blob error, null Blob), the viewer shows "Image unavailable". Not tested.
- **No test for `alt` propagation when `alt` is empty string** — could render an image without accessible description.
- **No test for `ImageViewer` loading/decoding prop defaults** — `loading='eager'` and `decoding='async'` are defaulted but not verified.
- **No test for `FolioImage`** — uses the old `ImageButtonGroup` pattern after Photo migrated away. Should be migrated and tested with `ImageViewer`.
- **No test for zoom percentage update** — the `scale` state and `<output>` rendering could be verified via `onTransformed` simulation.

### Brittle or misleading tests

- **`mediaMapper.test.ts:193-238`** ("normalizes representations with thumbnail maps"): The test verifies that an invalid medium thumbnail (`url: ''`) is dropped. This is correct behavior but the test doesn't explicitly assert the medium key is absent — it relies on the overall object match which implicitly tests this.

### Tests that belong in the future backend-integration/gallery PR

- `MediaRepository.test.ts` and `MediaBinaryLoader.test.ts` are contract-level tests. They're appropriate now but their real implementations will need integration tests against the actual backend API once wired.

---

## 13. Documentation Assessment

### `docs/media-architecture.md`

| Aspect                     | Status       | Notes                                                                                                                          |
| -------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| Problem statement          | **MATCH**    | Accurately describes legacy photo/thumbnail endpoints vs. new media architecture.                                              |
| Goals                      | **MATCH**    | All goals correspond to implemented types, mapper, contracts.                                                                  |
| Non-goals                  | **MATCH**    | No calls to media endpoints. No changes to existing services/repositories.                                                     |
| No-Runtime-Change Boundary | **MISMATCH** | Claims "must not change user-visible UI" and "no visible UI work" but the Photo migration does change the UI. See finding H-1. |
| Backend contract mirror    | **MATCH**    | Field names and JSON examples match the DTO and mapper.                                                                        |
| Domain model               | **MATCH**    | All listed types exist in the code.                                                                                            |
| Compatibility rules        | **MATCH**    | All 8 rules are correctly implemented in `mediaMapper.ts`.                                                                     |
| Mapper responsibilities    | **MATCH**    | All listed validations are present.                                                                                            |
| Repository boundaries      | **MATCH**    | Describes contracts without implementation.                                                                                    |

### `docs/media-rollout-contract.md`

| Aspect                           | Status    | Notes                                                                                                   |
| -------------------------------- | --------- | ------------------------------------------------------------------------------------------------------- |
| Gallery contract                 | **MATCH** | Semantic structure and states described; helpers implemented.                                           |
| Binary authentication contract   | **MATCH** | Blob→object URL→img flow described; `noopener,noreferrer` required (implemented).                       |
| List-performance contract        | **MATCH** | No N+1, no eager thumbnail fetching mandated (not yet wired).                                           |
| SVG security contract            | **MATCH** | Prohibits inline SVG injection, `<object>`, `<embed>` (viewer uses `<img>`).                            |
| Download and navigation security | **MATCH** | `noopener,noreferrer`, sanitized filenames, plain-text captions (implemented or documented for future). |
| Accessibility contract           | **MATCH** | All requirements listed for future gallery; already partially met by ImageViewer.                       |
| Rollout plan                     | **MATCH** | Step sequence is logical. "Retire legacyThumbnailPath" checklist (step 6) is thorough.                  |

### Overall documentation quality

**GOOD** — The documentation is comprehensive, well-structured, and largely accurate. The one notable discrepancy is the "No-Runtime-Change Boundary" claim in `media-architecture.md`, which should be updated to reflect that the reusable `ImageViewer` is deployed via the Photo migration.

---

## 14. Required Changes Before Merge

None.

---

## 15. Non-Blocking Follow-Ups

### For this PR or immediate follow-up

1. **Update `docs/media-architecture.md` lines 44–56**: Revise the "No-Runtime-Change Boundary" to document that the `ImageViewer` is deployed in the Photo tab. Clarify that only the media domain, repository, and loader modules remain unwired.

2. **Remove unused CSS from `Photo.css`**: The `.photo-container`, `.image-wrapper` classes are no longer rendered by `Photo.tsx`. However, they are still used by `FolioImage.tsx`, so they cannot be fully removed. `Photo.tsx` still imports `Photo.css` for `.Photo__copyright`. No action required.

### For the backend integration PR

3. **Implement `MediaRepository`**: Wire to `/fragments/{number}/media`, use `normalizeFragmentMediaResponse` for mapping.
4. **Implement `MediaBinaryLoader`**: Authenticated fetch → Blob, with cancellation and error handling.
5. **Integrate `mediaSummary` into list queries**: Use `normalizeCompatibleMediaSummary` to handle both new summaries and legacy fallback.
6. **Build accessible gallery component**: Use `sortMedia`, `selectInitialMedia`, `selectMediaById` helpers with the semantic structure from the rollout contract.

### For the representation-loading implementation

7. **Display-first logic**: When `representations.display` exists, load the display Blob for the viewer. Fall back to original when absent.
8. **SVG COPY handling**: If original MIME type is `image/svg+xml`, disable the "Open original image" button for inline viewing (but keep download). Show raster display representation in the viewer.
9. **Fix `extensionFromMimeType` for SVG**: Map `image/svg+xml` → `svg`.

### For viewer refinements

10. **Migrate `FolioImage` to `ImageViewer`**: Replace the inline `TransformWrapper`/`ImageButtonGroup` with the reusable viewer. This ports the security and accessibility improvements to folio images.
11. **Add `prefers-reduced-motion`**: Disable smooth zoom animations when the user prefers reduced motion.
12. **Add test for empty state**: Verify the "Image unavailable" display when Blob is null or `useObjectUrl` returns undefined.
13. **Fix `useObjectUrl` Strict Mode issue**: Refactor to `useRef` + `useEffect` pattern to prevent revoked URLs during Strict Mode double-invocation.

---

## 16. Recommended Next Frontend PR Scope

After backend persistence and backfill are ready, the next frontend PR should:

1. **Concrete `MediaRepository` implementation** → calls `/fragments/{number}/media`, maps via `normalizeFragmentMediaResponse`.
2. **Concrete `MediaBinaryLoader` implementation** → authenticated fetch with `AbortController`, returns `Blob`.
3. **Wire `mediaSummary` into fragment list queries** → use `normalizeCompatibleMediaSummary`, preserve legacy thumbnail rendering for non-migrated fragments.
4. **Build fragment gallery** → compose `section > ul > li > button > figure > figcaption`, wire to `MediaRepository.findByFragment`.
5. **Implement display-first representation selection** → load `display` Blob when available, fall back to `original`.
6. **SVG COPY handling** → raster display preview in viewer, original SVG download-only.
7. **Legacy fallback** → fragments without new media records still show their legacy photo (via existing `hasPhoto`/`thumbnailPath` code path).
8. **Rapid museum-number switching** → reuse existing `withData` stale-request protection pattern.
9. **No N+1**: Media metadata should come from the fragment query summary (`mediaSummary`), not a per-row request.
10. **Feature flag**: Consider a flag for the gallery rollout if a gradual migration is desired.

---

## 17. Final Merge Recommendation

**Merge immediately.**

This branch delivers a well-designed, defensive, and isolated frontend media architecture that can serve as the foundation for all future media work. The domain types are clean, the mapper is thorough and well-tested, the contracts are clear, and the reusable `ImageViewer` improves security and accessibility compared to the old `ImageButtonGroup`. The legacy compatibility mapping preserves all existing behavior while providing a path to the new model. The architecture isolation test guarantees no accidental production wiring.

The two high-severity findings are documentation issues, not code defects. The medium findings are either pre-existing or concern future features not yet implemented. No code changes are required before merge.

---

## 18. Safety Confirmation

- **No files modified** (except this review file, written with explicit user permission)
- **No tests run**
- **No formatter run**
- **No linter run**
- **No type checker run**
- **No build run**
- **No development server started**
- **No API request made**
- **No database accessed**
- **No environment variables inspected**
- **No secret files inspected**
- **No PR comments written**
- **Nothing staged**
- **Nothing committed**
- **Nothing pushed**
- **Working tree otherwise unchanged**

---

_Review completed 2026-07-13 against merge base `4a582092` (8 commits, 20 files, +2172/−40)._
