# Frontend Media Architecture

## Problem Statement

The frontend exposes fragment image behavior through legacy `hasPhoto` and
`thumbnailPath` fields plus dedicated photo and thumbnail endpoints. The eBL
media redesign introduces richer media metadata without guaranteeing that the
corresponding backend routes or persistence layer are available at the same
time as frontend work that targets them.

This document defines an architecture-only frontend contract that mirrors the
proposed backend media shape while preserving all current runtime behavior.
See [`02-data-and-api.md`](02-data-and-api.md) for the DTO, mapping, and API
contract details.

## Goals

- Stable frontend media domain types for `PHOTO` and `COPY`.
- Support for multiple media items per fragment, fragment-specific ordering,
  and fragment-specific primary selection.
- Support for original and thumbnail representations with future raster and
  SVG copy handling.
- Normalization of legacy `hasPhoto` and `thumbnailPath` fields into a
  compatible media summary shape.
- Repository and binary-loading boundaries defined without implementing
  network access.
- Independence from MongoDB, route availability, and current runtime wiring.

## Architecture-Only Boundary

The media architecture modules are isolated from current production imports.
They may be imported by tests and documentation examples only, until a later
runtime integration PR connects them deliberately. This isolation is enforced
by `src/fragmentarium/infrastructure/mediaArchitectureIsolation.test.ts`.

This architecture work must not:

- Change user-visible UI.
- Add network traffic.
- Modify existing image rendering.
- Alter current authentication behavior.
- Introduce a working gallery.

## Layer Responsibilities

- **Domain** (`fragmentarium/domain/media.ts`, `mediaGallery.ts`) — readonly
  types and pure selection/sorting helpers. Independent from React, HTTP
  clients, repository implementations, browser APIs, authentication scopes,
  backend storage identifiers, and filenames.
- **Infrastructure** (`fragmentarium/infrastructure/media*.ts`) — DTOs and
  defensive mappers that normalize raw, possibly malformed backend payloads
  into domain types. Normalization must not perform network requests, DOM
  work, object URL creation, cache mutation, or authorization decisions.
- **Application** (`fragmentarium/application/MediaRepository.ts`,
  `MediaBinaryLoader.ts`) — repository and binary-loader contracts. No
  runtime implementation exists yet; only the interfaces are defined.
- **UI** — not part of this architecture. No gallery, viewer, route, tab, or
  other visible media UI exists yet.

Media IDs are opaque UUID strings from the backend contract. The frontend
must use them as stable identity values and must not derive identity from
museum number, filename, checksum, URL, or array position.

SVG is not a separate media type. An SVG hand copy is represented by
`type = COPY` with `representations.original.mimeType = image/svg+xml`.

## Repository and Binary-Loader Roles

The future media metadata repository is separate from binary loading, keeping
metadata and binary content concerns independent:

- `MediaRepository.findByFragment(fragmentNumber, signal?)` fetches
  `/fragments/{number}/media`, maps raw DTOs into normalized domain media
  resources, and handles API-level failures.
- `MediaBinaryLoader.fetch(request, signal?)` retrieves authenticated media
  binaries in a later runtime PR and remains separate from metadata concerns.

Both contracts accept an optional, final `AbortSignal` parameter so future
implementations can support native request cancellation
(see [`02-data-and-api.md`](02-data-and-api.md#cancellation)). The current
frontend must not implement either network path in this architecture-only
work.

## Future Gallery Contract

A later runtime integration should compose a labelled media section with this
semantic structure: `section`, `ul`, `li`, `button`, `figure`, `figcaption`,
`toolbar`.

Expected future gallery states: no media; one photo; multiple photos; photo
plus copies; copies only; raster copy; SVG copy with raster preview; SVG copy
without raster preview; caption, attribution, and references; per-item
loading and error states.

The current architecture includes pure sorting and selection helpers only. It
does not render a gallery.

## Accessibility Responsibilities

Future interactive media UI should prefer semantic HTML over heavy ARIA
composites, and should avoid defaulting to listbox, tab, or carousel patterns
when button lists and figures communicate the interaction clearly.

Required future behavior:

- Real buttons for media selection, with clear accessible names.
- `aria-pressed` or an equivalent selected-state signal.
- Meaningful image alt text.
- Figure and figcaption association.
- Keyboard focus movement, with Enter/Space selection and Home/End support
  where appropriate.
- Accessible loading and error states, with visible focus styling.
- Reduced-motion support and adequate touch targets.
- No color-only meaning.

## Security Boundaries

- Restricted media must remain backend-authorized; the frontend must not
  derive authorization from project membership, scopes, media type,
  filename, or fragment project metadata.
- Bearer tokens must never appear in URLs or DOM attributes.
- Components must not decide whether media is public or restricted — the
  repository or binary loader owns authenticated fetch behavior.

See [`02-data-and-api.md`](02-data-and-api.md) for the SVG rendering and
download/navigation security requirements that apply once binary loading is
implemented.
