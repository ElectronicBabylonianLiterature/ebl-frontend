# Terrain and 3D architecture

## Terrain — implemented

### Source selection

Two candidates were evaluated against the gates in the phase brief.

| Gate                               | AWS Open Data terrain-tiles                                                                         | Copernicus GLO-30                                                                   |
| ---------------------------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Explicit licence / attribution     | Yes — [tilezen/joerd attribution](https://github.com/tilezen/joerd/blob/master/docs/attribution.md) | Yes, but access is via account-gated portals                                        |
| Direct tile URL usable by MapLibre | Yes, Terrarium PNG                                                                                  | No — GeoTIFF requiring local processing to raster-dem tiles                         |
| CORS                               | Yes, verified `Access-Control-Allow-Origin: *`                                                      | Not applicable without self-hosting                                                 |
| Requires a credential              | No                                                                                                  | Yes for the Copernicus Data Space; would mean embedding a key or building a proxy   |
| Coverage over the eBL sites        | Verified, see below                                                                                 | Would need hosting the frontend cannot currently provide                            |
| **Outcome**                        | **Selected**                                                                                        | **Rejected — would require credentials and a hosting pipeline that does not exist** |

### Verification performed on 2026-08-05

`https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png`

- `Access-Control-Allow-Origin: *`, `Access-Control-Allow-Methods: GET`.
- No credential in the URL; the source-validation gate rejects any template
  containing `access_token`, `api_key`, `apikey`, `{key}` or `token=`.
- z14 tiles fetched successfully for all four sites, with real payloads:

  | Site   | z/x/y         | Bytes  | `x-amz-meta-x-imagery-sources`        |
  | ------ | ------------- | ------ | ------------------------------------- |
  | Aššur  | 14/10160/6464 | 67 612 | `eudem…n35e040.tif, srtm/N35E043.tif` |
  | Kalḫu  | 14/10163/6428 | 50 779 | `eudem…n35e040.tif, srtm/N36E043.tif` |
  | Nippur | 14/10250/6646 | 97 707 | `srtm/N32E045.tif`                    |
  | Uruk   | 14/10269/6689 | 94 688 | `srtm/N31E045.tif`                    |

- z15 available; z16 returns 404. `maxZoom` is therefore set to 15.
- Underlying data over Iraq is **SRTM**, courtesy of the U.S. Geological Survey.

### Attribution

`TERRAIN_ATTRIBUTION` in `src/map/mapTerrainSource.ts` reproduces the clauses of
the joerd requirement that apply to the tiles actually served here, and is
passed to MapLibre as the source `attribution`, so it appears in the map's own
attribution control. The licence URL is linked from the terrain panel.

### Honest labelling

The control is called **Modern elevation model**, and `TERRAIN_PRECISION_NOTE`
states it is _present-day ground elevation, not ancient ground level or
excavated stratigraphy_. Both strings are asserted by tests.

### Implementation

| Module                    | Responsibility                                                                                                                                                                                          |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mapTerrainSource.ts`     | The single approved source plus the rights, transport and zoom gates. `approvedTerrainSource()` returns `null` when any gate fails.                                                                     |
| `mapTerrainCapability.ts` | Device gating and exaggeration. Reduced motion lowers exaggeration from 1.4 to 1.0. A device reporting `deviceMemory < 2` or `hardwareConcurrency < 4` is treated as low-power and terrain is withheld. |
| `mapTerrainLayers.ts`     | `raster-dem` source, hillshade layer, `setTerrain`, and teardown. Exaggeration is clamped to `[0, 2.5]`.                                                                                                |
| `useMapTerrain.ts`        | Lifecycle. Removes terrain, hillshade and source on unmount or when switched off.                                                                                                                       |
| `MapTerrainPanel.tsx`     | Toggle, note, attribution, licence link, low-power explanation.                                                                                                                                         |

Terrain state persists in the URL as `t=1` and resets to 2D through the existing
reset control.

### Not done

- Contours. `maplibre-contour` was reviewed and **not added**: it is another
  runtime dependency serving a legibility nicety, and the hillshade already
  carries relief. Revisit only with a bundle measurement that justifies it.

## 3D models — not implemented

No approved asset exists; see
[map-3d-asset-research.md](map-3d-asset-research.md). No Three.js dependency,
custom layer, model catalogue or `.glb` was added.

The architecture below is recorded so the next phase does not re-derive it. It
is **not built**.

### Two separate modes, never interchangeable

**Georeferenced site model.** Only for an asset with a verified site, real
anchor coordinates, units, orientation, scale, altitude, licence and
redistribution rights. Rendered through a MapLibre `CustomLayerInterface`
synchronised to the map camera and to terrain, following the MapLibre
"adding 3D models using three.js on terrain" example.

**Museum-object viewer.** For reliefs, statues, tablets, gates and architectural
fragments. Rendered in an isolated Three.js viewer inside the inspector or a
modal — never placed on the map as a building, and always labelled _Museum
object associated with this site_ without implying the object remains at the
site.

### Constraints that would apply

- Dynamic import; nothing in the initial map bundle, no model loaded until
  selected.
- GLB transfer under 10–15 MB; textures at or below 4K.
- `GLTFLoader`, optionally `DRACOLoader`.
- Loading, progress and error states; explicit geometry, material and texture
  disposal; pause when hidden; reduced-motion mode; text alternative; citation
  and licence shown with the model; mobile fallback.
- Survey, scholarly reconstruction and museum object must be visibly
  distinguished, and reconstructions must carry a scholarly citation.

### Comparison and swipe

`maplibre-gl-compare` was **not adopted**: it has open maintenance and release
concerns, needs a second MapLibre map, and ships its own CSS.

Cross-fade comparison is implemented internally on the single map
(`mapComparison.ts`), because MapLibre 5.24 raster layers expose only
`raster-opacity`, `raster-hue-rotate`, `raster-brightness-*`, `raster-saturation`,
`raster-contrast` and `raster-resampling` — **no screen-space clipping**.

Split-screen swipe therefore requires a second synchronised WebGL map. It was
scoped and deliberately **not shipped in this phase**: it cannot be verified in
this headless environment, and shipping an unverified second WebGL context is
exactly the "impressive but unsupported" outcome this work is meant to avoid.
