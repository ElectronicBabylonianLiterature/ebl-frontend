# 3D heritage asset research

Search performed 2026-08-05 from the `final-map` frontend workspace. The outcome
is recorded whether or not it favours shipping a feature.

**Result: no candidate passed the gates. No 3D model code, model catalogue,
Three.js dependency or `.glb`/`.gltf` asset was added.** `has3dModels` stays
`false` in `src/map/mapSiteCapabilities.ts` and no 3D model control is rendered.

## Aliases searched

| Site   | Aliases used                                                      |
| ------ | ----------------------------------------------------------------- |
| Aššur  | Aššur, Ashur, Assur, Qal'at Sherqat, Qal'at Šerqat, Kalat Sherqat |
| Kalḫu  | Kalḫu, Kalhu, Nimrud, Calah                                       |
| Nippur | Nippur, Nuffar                                                    |
| Uruk   | Uruk, Warka, Erech                                                |

## Repositories searched

| Repository                                                                                                                  | Method                             | Result for the four eBL sites                                                                                                                                                                                                                                                                                 |
| --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OpenHeritage3D (`/data`)                                                                                                    | dataset listing retrieved directly | **No dataset.** The only occurrences of "Iraq" in the listing are incidental, inside the description of Ushaiger (Saudi Arabia), as a pilgrimage origin. No Aššur, Kalḫu, Nippur or Uruk dataset exists.                                                                                                      |
| CyArk projects                                                                                                              | project index requested            | Index is client-rendered and did not yield a machine-readable project list from this environment. CyArk's documented Mesopotamian work is **Babylon**, which is a different site and is explicitly not a substitute for any eBL site.                                                                         |
| British Museum official Sketchfab — "CyArk Assyrian scans" collection                                                       | collection page requested          | At least one model (_Lamassu_). Per-model licence, site attribution and download terms were **not retrievable** from this environment and must be verified per model. Lamassu figures derive from Nimrud, Khorsabad or Nineveh; none are Aššur, Nippur or Uruk architecture, and none carry spatial metadata. |
| Tech 4 Heritage — "Nimrud archaeological site" (Sketchfab)                                                                  | model page retrieved               | See ledger below. **Rejected.**                                                                                                                                                                                                                                                                               |
| Zenodo, Figshare, university and excavation repositories, Iraq SBAH, DAI/LMU project repositories, museum open-data portals | surveyed                           | No asset was found that carries the full rights **and** georeferencing metadata this integration requires.                                                                                                                                                                                                    |

Generic commercial marketplace models were excluded by policy and were not
evaluated.

## Candidate asset ledger

### Tech 4 Heritage — _Nimrud archaeological site_

| Field                            | Value                                                                                                                       |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Asset title                      | Nimrud archaeological site                                                                                                  |
| Site                             | Kalḫu (alias _Nimrud_)                                                                                                      |
| Alias used to find it            | Nimrud                                                                                                                      |
| Source institution               | Not stated                                                                                                                  |
| Source URL                       | https://sketchfab.com/3d-models/nimrud-archaeological-site-570b9858c2734901b0030f948998aa2f                                 |
| Creator                          | Tech 4 Heritage (`@techforheritage`)                                                                                        |
| Asset type                       | Mesh, photogrammetry (per model tags)                                                                                       |
| Survey / reconstruction / object | **Not stated.** Tagged photogrammetry, but the model does not state whether it records extant remains or an interpretation. |
| Date / version                   | Not stated                                                                                                                  |
| Licence                          | **Not stated on the model page.**                                                                                           |
| Download allowed                 | **Not stated.**                                                                                                             |
| Redistribution allowed           | **Not stated.**                                                                                                             |
| Commercial use allowed           | **Not stated.**                                                                                                             |
| Attribution                      | Creator name only                                                                                                           |
| File format                      | Not stated                                                                                                                  |
| Compressed size                  | Not stated                                                                                                                  |
| Texture size                     | Not stated                                                                                                                  |
| Coordinate system                | **None.**                                                                                                                   |
| Georeferencing                   | **None.** No anchor coordinate, altitude, rotation or scale.                                                                |
| Units                            | Not stated                                                                                                                  |
| Orientation                      | Not stated                                                                                                                  |
| Scale                            | Not stated                                                                                                                  |
| Geometry                         | 178.7k triangles, 90.3k vertices                                                                                            |
| CORS                             | Not evaluated — blocked earlier in the gate sequence                                                                        |
| Stable identifier / DOI          | None                                                                                                                        |
| Scholarly source                 | None                                                                                                                        |
| **Decision**                     | **rejected-rights**, and independently **rejected-provenance** and **rejected-georeferencing**                              |

Three independent stop conditions apply: a model lacking an explicit licence, a
model lacking provenance, and a site model lacking georeferencing. Any one of
them is sufficient. The model was not downloaded.

### CyArk — Babylon

| Field        | Value                       |
| ------------ | --------------------------- |
| Site         | Babylon                     |
| **Decision** | **research-reference-only** |

Useful as a technical and presentation reference for how a documented
Mesopotamian survey is published. **It is not a substitute model for Aššur,
Kalḫu, Nippur or Uruk**, and merging it into any of those sites would violate
the data-integrity rules.

### British Museum Sketchfab — Assyrian object scans

| Field          | Value                                                              |
| -------------- | ------------------------------------------------------------------ |
| Asset type     | Museum-object model (reliefs, statues, architectural elements)     |
| Georeferencing | None, and none expected — these are museum objects                 |
| **Decision**   | **research-reference-only** pending per-model licence verification |

These are museum objects, not site architecture. Even with a permissive
per-model licence they must never be placed as buildings at an excavation site,
and displaying one would require stating _Museum object associated with this
site_ — never implying the object remains physically at the site. No
per-model licence could be verified from this environment, so none was adopted.

## Why nothing was integrated

Integrating any of the above would have required one of:

- redistributing an asset whose licence is not established;
- fabricating an anchor coordinate, altitude, rotation, scale or unit;
- presenting a museum object as site architecture;
- presenting a model from Babylon, Nineveh or Khorsabad as one of the four eBL
  sites.

All four are prohibited. Partial, well-provenanced 3D support was preferred, and
in this phase the well-provenanced subset is empty.

## What would unblock this

1. A model with an explicit, recorded licence permitting redistribution.
2. Documented provenance: creator, institution, method, date and citation.
3. For a **site** model: anchor coordinate, altitude, rotation, scale and units,
   in a stated CRS, supplied by the excavation project — never inferred.
4. A hosting location that serves the asset with CORS headers.
5. Classification stated by the depositor as survey, scholarly reconstruction or
   museum object. These are never interchangeable.
6. A delivery budget: GLB transfer under 10–15 MB, textures at or below 4K.

The rendering architecture that would consume such an asset is recorded in
[map-terrain-and-3d-architecture.md](map-terrain-and-3d-architecture.md); it was
deliberately not built, because unused scaffolding for an asset that does not
exist is worse than its absence.
