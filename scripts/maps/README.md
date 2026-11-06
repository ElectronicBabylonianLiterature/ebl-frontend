# Findspot map asset handoff

The backend transfer archive supplies canonical inventories and mappings, without geometry. The versioned `ARTIFACT_MANIFEST.json` contract records content-addressed metadata, source revisions and the expected polygon identities. Use the checked-out four-site frontend geometry; its geometry checksums must match the inventories. Compatibility does not depend on a frontend commit surviving a rebase. Keep transfer files in the ignored repository-root `.map-processing` directory.

Run the regression check against the extracted transfer and a directory containing the four site GeoJSON files:

```sh
python3 scripts/maps/test_findspot_map_handoff.py \
  --artifact-dir .map-processing/backend-artifacts \
  --findspot-dir public/map-data/findspots \
  -v
```

The check copies inputs to temporary directories. It preserves supplied transfer and site manifests, exercises the generator's default expectations against actual metadata, checks unchanged geometry and canonical polygon identities, verifies byte-identical repeated generation, and ensures invalid mappings or tampered manifests cannot replace existing output files. It requires all four sites and fails if the handoff is incomplete or the defaults have drifted. In the stacked PR sequence, run it after the multisite geometry slice is present or supply geometry exported from that slice.

To update assets after a successful check:

```sh
python3 scripts/maps/build-findspot-map-assets.py \
  --artifact-dir .map-processing/backend-artifacts \
  --findspot-dir public/map-data/findspots
```

Generation publishes `manifest.json` atomically alongside the five GeoJSON files. It records their SHA-256 hashes, canonical polygon and mapping counts, and the mapping source revisions. The versioned transfer contract is validated for schema, content digest, exact metadata filenames and hashes, four-site identities, counts and revisions before publication. Its stable contract revision and producer are retained. Older metadata-only handoffs and optional per-site manifests remain supported; supplied site manifest hashes are checked when no transfer contract is present, and absent manifest revisions remain `null`. Duplicate object keys and non-finite JSON are rejected. Research exports can identify the geometry by `manifest.files["all.geojson"]`.

When the research-export slice is present, also copy `public/map-data/findspots/manifest.json` to `src/map/mapArtifactProvenance.json` and commit both manifests together. The export regression check requires the bundled provenance to equal the published asset manifest.

For an intentional metadata revision, review and update the default counts alongside its inputs. `--expectations` remains available for explicitly reviewed alternative datasets; the default regression check deliberately does not use that override.
