# Frontend Media Data and API Contract

Companion to [`01-architecture.md`](01-architecture.md), which defines the
layer boundaries this document's DTOs and mappers live inside.

## Backend Contract Mirror

The frontend architecture mirrors the following backend-facing names exactly:
`mediaSummary`, `count`, `types`, `primary`, `thumbnail`, `representations`,
`original`, `thumbnails`, `sortOrder`, `isPrimary`, `caption`, `attribution`,
`references`.

Expected list-summary payload:

```json
{
  "mediaSummary": {
    "count": 3,
    "types": ["PHOTO", "COPY"],
    "primary": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "type": "PHOTO",
      "thumbnail": {
        "url": "/fragments/K.1/media/550e8400-e29b-41d4-a716-446655440000/thumbnail/small",
        "mimeType": "image/jpeg",
        "width": 240,
        "height": 180
      }
    }
  },
  "hasPhoto": true,
  "thumbnailPath": "/fragments/K.1/thumbnail/small"
}
```

Expected fragment-media payload:

```json
{
  "media": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "type": "PHOTO",
      "sortOrder": 0,
      "isPrimary": true,
      "caption": "Obverse",
      "attribution": "© The British Museum",
      "references": [{ "id": "bibliography-id" }],
      "representations": {
        "original": {
          "url": "/fragments/K.1/media/550e8400-e29b-41d4-a716-446655440000/file",
          "mimeType": "image/jpeg",
          "width": 4000,
          "height": 3000
        },
        "thumbnails": {
          "small": {
            "url": "/fragments/K.1/media/550e8400-e29b-41d4-a716-446655440000/thumbnail/small",
            "mimeType": "image/jpeg",
            "width": 240,
            "height": 180
          }
        }
      }
    }
  ]
}
```

## DTO Model

Raw DTO interfaces (`fragmentarium/infrastructure/mediaDtos.ts`) stay
separate from normalized domain types and are intentionally permissive
(fields typed as `unknown`), so mapper logic can validate and normalize
malformed or partially migrated backend data without crashing rendering:
`MediaRepresentationDto`, `MediaSummaryPrimaryDto`, `MediaSummaryDto`,
`MediaReferenceDto`, `MediaResourceDto`, `FragmentMediaResponseDto`.

## Compatibility Rules

The compatibility mapper (`normalizeCompatibleMediaSummary`) accepts the new
`mediaSummary` payload together with the legacy `hasPhoto` and
`thumbnailPath` fields:

1. A valid normalized `mediaSummary` wins over legacy fields.
2. Legacy `hasPhoto: true` with `thumbnailPath` normalizes to a one-item
   `PHOTO` summary whose primary thumbnail URL is the legacy path
   (`legacyThumbnailPath`).
3. Legacy `hasPhoto: true` without `thumbnailPath` normalizes to a one-item
   `PHOTO` summary with no primary selection.
4. Legacy `hasPhoto: false` normalizes to `null`.
5. Malformed new summaries normalize safe sub-parts where possible and fall
   back to legacy data when the new summary is not trustworthy enough to use
   (for example a positive `count` with no usable type or primary).
6. `count > 0` without `primary` is valid.
7. `count = 0` must not retain `primary`.
8. Legacy fallback must not leak synthetic media identities unless a later UI
   integration proves that one is required.

### `legacyThumbnailPath` Retirement Criteria

`legacyThumbnailPath` may only be retired once all of the following hold:
migrated records have real media IDs; `mediaSummary` is populated for
migrated list results; new thumbnail loading has been deployed and verified;
legacy-only responses are no longer expected; backend and frontend remove the
field in a coordinated change; and rollback no longer depends on the legacy
path.

## Mapper Responsibilities

Pure normalization functions (`fragmentarium/infrastructure/media*Mapper.ts`)
are responsible for: validating `MediaType`; validating non-negative integer
`count`; deduplicating `types`; validating media URLs as non-empty strings;
validating dimensions as positive integers when present; validating
`sortOrder` as a non-negative integer; validating `isPrimary` as a boolean;
normalizing optional caption and attribution text; preserving reference IDs
only when valid; normalizing thumbnail maps; and excluding malformed detail
media items instead of crashing the entire collection when possible.

Normalization must not perform network requests, DOM work, object URL
creation, cache mutation, or authorization decisions. Text normalization uses
a single shared primitive, `normalizeNonEmptyString`
(`fragmentarium/infrastructure/mediaMapperValidation.ts`) — trims and rejects
blank strings. Media-specific wrappers exist only where they add real
validation (for example `normalizeThumbnailSize`, which checks membership in
`ThumbnailSizes`); a helper is not given a more specific name (such as a URL
validator) unless it performs that validation.

## Cancellation

`MediaRepository.findByFragment` and `MediaBinaryLoader.fetch` both accept an
optional, final `signal?: AbortSignal` parameter, consistent with the
project's native-Promise/`AbortController` cancellation convention. The
signal is optional so architecture consumers are never required to provide
one; a concrete implementation must accept it and forward it to `ApiClient`
or `fetch` rather than silently ignoring it. No Bluebird, cancellable-promise
wrapper, or custom promise subclass may be introduced to satisfy
cancellation.

## API Efficiency Requirements

The future list flow must preserve compact query behavior: one fragment
query returns a compact `mediaSummary` per result, and thumbnail binary
requests are issued only for items near the viewport. It must not add a
media metadata request per search row, a fragment detail request per search
row, eager thumbnail requests for every result, or a full-original fallback
when a thumbnail is missing.

Expected reuse from current frontend infrastructure: near-viewport
observation, thumbnail request concurrency limits, in-flight request
deduplication, LRU and Blob caching, object URL cleanup, stale-request
protection, and existing query-summary rendering paths.

## Binary Authentication Requirements

A raw `<img src="/protected-media-route">` cannot reliably attach a bearer
token. The first runtime implementation of authenticated media loading must
follow `authenticated API fetch → Blob → object URL → image element`, with:

- Bearer tokens never appearing in URLs.
- Components never deciding whether media is public or restricted.
- The repository or binary loader owning authenticated fetch behavior.
- Requests supporting cancellation (see [Cancellation](#cancellation)).
- Object URLs revoked when no longer needed.
- Restricted binary caches invalidated on authentication identity change.
- Direct URL optimization allowed only for explicitly public media.

## SVG and MIME Handling Requirements

The frontend must never fetch SVG text and inject it into the DOM, use
`dangerouslySetInnerHTML`, use `<object>` or `<embed>`, render untrusted raw
inline SVG, or infer media format from a filename extension alone (MIME type
must come from the DTO's `mimeType` field, validated against an allowlist,
not from `mimeType.split('/')` alone).

Future rendering rules:

- Raster `PHOTO`: authenticated Blob fetch, rendered through `<img>`, reusing
  existing zoom/pan behavior, with safe download and safe new-tab behavior.
- Raster `COPY`: same technical rendering path as raster `PHOTO`, labelled as
  `COPY`.
- SVG `COPY` with raster preview: display the raster preview only; keep the
  original SVG download-only; never open the original SVG in a new tab.
- SVG `COPY` without raster preview: show an unavailable-preview state and
  allow download where authorized, without rendering the original SVG.
- Unsupported MIME types: do not inline render; show a generic unavailable
  state; allow download only where explicitly supported by the MIME
  allowlist.

## Download and Navigation Security Requirements

- `window.open` must use `noopener,noreferrer`.
- External navigation must use the existing safe-link component.
- Download extensions must come from a static MIME allowlist.
- Generated filenames must be sanitized.
- Caption and attribution must render as plain text, never as HTML.
- New-tab object URLs must not be revoked before the opened tab has loaded.
- Tokens must never appear in URLs or DOM attributes.
