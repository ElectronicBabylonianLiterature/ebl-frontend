# Frontend Media Rollout Contract

This companion document captures the future runtime constraints for the
architecture-only media foundation defined in `docs/media-architecture.md`.

## Future Gallery Contract

The later runtime integration should compose a labelled media section with this
semantic structure:

- `section`
- `ul`
- `li`
- `button`
- `figure`
- `figcaption`
- `toolbar`

Expected future gallery states:

- No media
- One photo
- Multiple photos
- Photo plus copies
- Copies only
- Raster copy
- SVG copy with raster preview
- SVG copy without raster preview
- Caption, attribution, and references
- Per-item loading and error states

The current architecture includes pure sorting and selection helpers only. It
does not render a gallery.

## Future Binary Authentication Contract

Restricted media must continue to be backend-authorized. The frontend must not
derive authorization from project membership, scopes, media type, filename, or
fragment project metadata.

A raw `<img src="/protected-media-route">` cannot reliably attach the required
bearer token. The first runtime implementation should therefore follow:

```text
authenticated API fetch
→ Blob
→ object URL
→ image element
```

Requirements for the later runtime implementation:

- Bearer tokens never appear in URLs.
- Components do not decide whether media is public or restricted.
- The repository or binary loader owns authenticated fetch behavior.
- Requests support cancellation.
- Object URLs are revoked when no longer needed.
- Authentication identity changes invalidate restricted binary caches.
- Direct URL optimization is allowed only for explicitly public media.

## Future List-Performance Contract

The future list flow must preserve compact query behavior:

```text
one fragment query
→ compact mediaSummary per result
→ thumbnail binary requests only near viewport
```

The future implementation must not add:

- A media metadata request per search row
- A fragment detail request per search row
- Eager thumbnail requests for every result
- Full-original fallback when a thumbnail is missing

Expected reuse from current frontend infrastructure:

- Near-viewport observation
- Thumbnail request concurrency limits
- In-flight request deduplication
- LRU and Blob caching
- Object URL cleanup
- Stale-request protection
- Existing query-summary rendering paths

## Future SVG Security Contract

The frontend must never:

- Fetch SVG text and inject it into the DOM
- Use `dangerouslySetInnerHTML`
- Use `<object>`
- Use `<embed>`
- Render untrusted raw inline SVG
- Infer media format from filename extension alone

Future rendering rules:

- Raster `PHOTO`: authenticated Blob fetch, render through `<img>`, reuse
  existing zoom/pan behavior, allow safe download and safe new-tab behavior
- Raster `COPY`: same technical rendering path as raster `PHOTO`, labelled as
  `COPY`
- SVG `COPY` with raster preview: display the raster preview only, keep the
  original SVG download-only, and do not open the original SVG in a new tab
- SVG `COPY` without raster preview: show an unavailable-preview state and
  allow download where authorized without rendering the original SVG
- Unsupported MIME types: do not inline render, show a generic unavailable
  state, and allow download only where explicitly supported

## Future Download and Navigation Security Contract

Later runtime work must ensure that:

- `window.open` uses `noopener,noreferrer`
- External navigation uses the existing safe-link component
- Download extensions come from a static MIME allowlist
- Generated filenames are sanitized
- Caption and attribution render as plain text
- New-tab object URLs are not revoked before the opened tab has loaded
- Restricted media caches are cleared on authentication identity change
- Tokens never appear in URLs or DOM attributes

## Accessibility Contract

Future interactive media UI should prefer semantic HTML over heavy ARIA
composites. Avoid defaulting to listbox, tab, or carousel patterns when button
lists and figures communicate the interaction clearly.

Required future behavior:

- Real buttons for media selection
- Clear accessible names
- `aria-pressed` or an equivalent selected-state signal
- Meaningful image alt text
- Figure and figcaption association
- Keyboard focus movement
- Enter and Space selection
- Home and End support where appropriate
- Accessible loading and error states
- Visible focus styling
- Reduced-motion support
- Adequate touch targets
- No color-only meaning

## Future Rollout Plan

Recommended later rollout sequence:

1. Add repository wiring for `/fragments/{number}/media` without changing
   current image rendering.
2. Integrate `mediaSummary` into list-query mapping while preserving legacy
   fallback and current `thumbnailPath` rendering.
3. Introduce an authenticated binary loader with cancellation, object URL
   lifecycle management, and auth-aware cache invalidation.
4. Build an accessible gallery component behind deliberate route or component
   integration work.
5. Add raster preview handling for SVG copies and safe download-only behavior
   for original SVGs.
6. Remove legacy compatibility paths only after backend responses and runtime
   consumers fully migrate.
