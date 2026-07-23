# Frontend Media Architecture

## Problem Statement

The frontend currently exposes fragment image behavior through legacy
`hasPhoto` and `thumbnailPath` fields plus dedicated photo and thumbnail
endpoints. The proposed eBL media redesign introduces richer media metadata
without guaranteeing that the new backend routes or persistence layer are
available at the same time as this frontend work.

This document defines an architecture-only frontend contract that mirrors the
proposed backend media shape while preserving all current runtime behavior.

## Goals

- Define stable frontend media domain types for `PHOTO` and `COPY`.
- Mirror backend DTO field names for `mediaSummary`, `media`,
  `representations`, `original`, `thumbnails`, `sortOrder`, `isPrimary`,
  `caption`, `attribution`, and `references`.
- Support multiple media items per fragment, fragment-specific ordering, and
  fragment-specific primary selection.
- Support original and thumbnail representations with future raster and SVG
  copy handling.
- Normalize legacy `hasPhoto` and `thumbnailPath` fields into a compatible
  media summary shape.
- Define future repository and binary-loading boundaries without implementing
  network access.
- Keep the architecture independent from MongoDB, route availability, and
  current runtime wiring.

## Non-Goals

- No calls to `/fragments/{number}/media` or media binary endpoints.
- No changes to `FragmentRepository`, `FragmentService`, `ImageRepository`, or
  current fragment query DTOs.
- No production mapper wiring, dependency injection changes, or bootstrap
  changes.
- No gallery component, reusable image viewer, route, tab, or visible UI work.
- No Blob fetching, object URL creation, caching implementation, or browser API
  behavior.
- No changes to CDLI, folio, photo, annotation, or current search-result image
  behavior.
- Runtime viewer extraction and image-toolbar consolidation are deferred to a
  later UI integration PR.

## No-Runtime-Change Boundary

The media architecture modules introduced by this work must remain isolated from
current production imports. They may be imported by tests and documentation
examples only until a later runtime integration PR connects them deliberately.

This architecture work must not:

- Change user-visible UI.
- Add network traffic.
- Modify existing image rendering.
- Alter current authentication behavior.
- Introduce a working gallery.

## Backend Contract Mirror

The frontend architecture mirrors the following backend-facing names exactly:

- `mediaSummary`
- `count`
- `types`
- `primary`
- `thumbnail`
- `representations`
- `original`
- `thumbnails`
- `sortOrder`
- `isPrimary`
- `caption`
- `attribution`
- `references`

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

## Domain Model

The frontend domain model stays small, readonly, and independent from React,
HTTP clients, repository implementations, browser APIs, authentication scopes,
backend storage identifiers, and filenames.

Core domain types:

- `MediaType = 'PHOTO' | 'COPY'`
- `ThumbnailSize = 'small' | 'medium' | 'large'`
- `MediaReference`
- `MediaRepresentation`
- `MediaRepresentations`
- `MediaSummaryPrimary`
- `MediaSummary`
- `MediaResource`
- `FragmentMedia`

Media IDs are opaque UUID strings from the backend contract. The frontend must
use them as stable identity values and must not derive identity from museum
number, filename, checksum, URL, or array position.

SVG is not a separate media type. An SVG hand copy is represented by:

- `type = COPY`
- `representations.original.mimeType = image/svg+xml`

## DTO Model

Raw DTO interfaces stay separate from normalized domain types. The DTO layer is
intentionally permissive so mapper logic can validate and normalize malformed or
partially migrated backend data without crashing rendering.

The DTO surface includes:

- `MediaRepresentationDto`
- `MediaSummaryPrimaryDto`
- `MediaSummaryDto`
- `MediaReferenceDto`
- `MediaResourceDto`
- `FragmentMediaResponseDto`

## Compatibility Rules

The compatibility mapper accepts the new `mediaSummary` payload together with the
legacy `hasPhoto` and `thumbnailPath` fields.

Rules:

1. A valid normalized `mediaSummary` wins over legacy fields.
2. Legacy `hasPhoto: true` with `thumbnailPath` normalizes to a one-item
   `PHOTO` summary whose primary thumbnail URL is the legacy path.
3. Legacy `hasPhoto: true` without `thumbnailPath` normalizes to a one-item
   `PHOTO` summary with no primary selection.
4. Legacy `hasPhoto: false` normalizes to `null`.
5. Malformed new summaries normalize safe sub-parts where possible and may fall
   back to legacy data when the new summary is not trustworthy enough to use.
6. `count > 0` without `primary` is valid.
7. `count = 0` must not retain `primary`.
8. Legacy fallback must not leak synthetic media identities unless a later UI
   integration proves that one is required.

## Mapper Responsibilities

Pure normalization functions are responsible for:

- Validating `MediaType`.
- Validating non-negative integer `count`.
- Deduplicating `types`.
- Validating media URLs as non-empty strings.
- Validating dimensions as positive integers when present.
- Validating `sortOrder` as a non-negative integer.
- Validating `isPrimary` as a boolean.
- Normalizing optional caption and attribution text.
- Preserving reference IDs only when valid.
- Normalizing thumbnail maps.
- Excluding malformed detail media items instead of crashing the entire
  collection when possible.

Normalization must not perform network requests, DOM work, object URL creation,
cache mutation, or authorization decisions.

## Repository Boundaries

The future media metadata repository is separate from binary loading.

Planned responsibilities:

- `MediaRepository.findByFragment(fragmentNumber)`
  - Fetches `/fragments/{number}/media`
  - Maps raw DTOs into normalized domain media resources
  - Handles API-level failures

- `MediaBinaryLoader.fetch(...)`
  - Retrieves authenticated media binaries in a later runtime PR
  - Remains separate from metadata concerns

The current frontend must not implement either network path in this
architecture-only work.
