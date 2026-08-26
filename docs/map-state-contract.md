# Map URL state contract

Version: `v=1`. Implemented in `src/map/mapUrlState.ts` (pure parse/serialize)
and `src/map/useMapUrlState.ts` (router synchronisation).

## Parameters

Serialized in this fixed order; parameters at their neutral value are omitted.

| Key    | Meaning                     | Format                      | Range / validation                                                                    | Omitted when                          |
| ------ | --------------------------- | --------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------- |
| `v`    | schema version              | integer                     | must equal `1`                                                                        | never                                 |
| `c`    | camera centre               | `<lng>,<lat>`               | lng clamped to ±180, lat to ±85.0511, 5 dp                                            | never                                 |
| `z`    | zoom                        | number                      | clamped to 0–24, 2 dp                                                                 | never                                 |
| `b`    | bearing                     | number                      | clamped to ±180, 1 dp                                                                 | `0`                                   |
| `p`    | pitch                       | number                      | clamped to 0–85, 1 dp                                                                 | `0`                                   |
| `l`    | visible layers              | comma list, sorted          | only `boundaries`, `areas`                                                            | never (empty list serializes as `l=`) |
| `o`    | active overlays             | `<id>:<opacity>` comma list | id must exist in the catalogue; opacity clamped 0–1, 2 dp; duplicates dropped; max 20 | no visible overlay                    |
| `site` | selected provenance         | string                      | mutually exclusive with `area`                                                        | no site selection                     |
| `area` | selected excavation polygon | canonical polygon id        | dropped when a known-polygon set is supplied and does not contain it                  | no area selection                     |
| `q`    | site-name filter            | string                      | truncated to 120 characters                                                           | empty                                 |
| `viz`  | choropleth mode             | enum                        | one of `mapped`, `count`, `log`, `density`; unknown values fall back to `mapped`      | mode is `mapped`                      |

## Deliberately not persisted

Authorization-sensitive counts, raw API responses, user identity, arbitrary
JSON, hover state, unfinished measurements, and MapLibre objects. Overlay
_order_ is preserved as written but overlay _visibility_ is not encoded
separately — a hidden overlay is simply absent.

## Validation behaviour

- A missing, non-numeric, or non-`1` `v` yields the full default state. Unknown
  future versions therefore degrade to the default view rather than erroring.
- Malformed numbers fall back to the corresponding default; out-of-range numbers
  are clamped, not rejected.
- Unknown layer keys and unknown overlay IDs are dropped silently; the rest of
  the state still applies.
- A polygon selection is dropped when the caller supplies `knownPolygonIds` and
  the ID is absent, so a removed polygon cannot resurrect a stale inspector.

## URL-length protection

`MAX_MAP_URL_LENGTH` is 2000 characters. If the serialized query exceeds it, the
state is re-serialized with `overlays: []`; overlays are the only unbounded
component. Everything else is bounded by construction.

## History semantics

`useMapUrlSync` compares the assembled state with the previous one:

- **Camera-only change** → debounced `navigate(..., { replace: true })` after
  `CAMERA_URL_DEBOUNCE_MS` (400 ms), so panning does not fill the history stack.
- **Selection, layer, overlay, filter or visualization change** → immediate
  `navigate(..., { replace: false })`, creating a history entry.
- A `location.search` that differs from the last value this hook wrote is
  treated as external navigation (back/forward) and is parsed and pushed back
  into component state via `restore`. Because the hook records what it wrote,
  restoring cannot re-trigger a write, so there is no map-movement loop.

`useMapCamera` subscribes to `moveend` only — never `move` — so continuous
panning and zooming produces no React updates.

## Determinism

`serializeMapUrlState` uses `stringify(..., { sort: false })` over a fixed key
order and sorts the layer list, so identical state always produces an identical
string. `parseMapUrlState(serializeMapUrlState(state))` round-trips, with layers
normalized to catalogue order (`boundaries`, `areas`).

## Share action

`MapShareLink` copies `window.location.href` via the async clipboard API. It
reports success and failure through an `aria-live="polite"` status region, and
degrades to an explicit "copy the address bar URL instead" message when the
clipboard API is unavailable or rejects. It sends nothing anywhere.

## Reserved for future phases

The following keys are **not implemented and not emitted**. They are listed only
so future work does not collide with existing ones: comparison mode, timeline
mode/value, spatial-search shape, terrain state. Adding any of
them requires bumping `MAP_URL_STATE_VERSION` only if the meaning of an existing
key changes; purely additive keys can stay at `v=1`.
