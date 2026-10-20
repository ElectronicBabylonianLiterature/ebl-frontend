# Findspot map asset handoff

The backend transfer archive supplies canonical inventories and mappings, without geometry. Use geometry from the frontend revision recorded in its `ARTIFACT_MANIFEST.txt`, and verify the archive's file checksums before generation. Keep transfer files in the ignored repository-root `.map-processing` directory.

Run the regression check against the extracted transfer and a directory containing the four site GeoJSON files:

```sh
python3 scripts/maps/test_findspot_map_handoff.py \
  --artifact-dir .map-processing/backend-artifacts \
  --findspot-dir public/map-data/findspots \
  -v
```

The check copies inputs to temporary directories. It exercises the generator's default expectations against actual metadata, checks unchanged geometry and canonical polygon identities, verifies byte-identical repeated generation, and ensures invalid mappings cannot replace existing output files. It requires all four sites and fails if the handoff is incomplete or the defaults have drifted. In the stacked PR sequence, run it after the multisite geometry slice is present or supply geometry exported from that slice.

To update assets after a successful check:

```sh
python3 scripts/maps/build-findspot-map-assets.py \
  --artifact-dir .map-processing/backend-artifacts \
  --findspot-dir public/map-data/findspots
```

For an intentional metadata revision, review and update the default counts alongside its inputs. `--expectations` remains available for explicitly reviewed alternative datasets; the default regression check deliberately does not use that override.
