from __future__ import annotations

import hashlib
import json
from pathlib import Path
from typing import Any


def json_bytes(value: object) -> bytes:
    return json.dumps(value, ensure_ascii=False, separators=(",", ":")).encode("utf-8")


def _input_revision(artifact_dir: Path, site: str) -> dict[str, Any]:
    path = artifact_dir / f"{site}_artifact_manifest.json"
    if not path.exists():
        return {"artifactSourceRevision": None, "artifactManifestSha256": None}
    contents = path.read_bytes()
    manifest = json.loads(contents)
    if (
        not isinstance(manifest, dict)
        or type(manifest.get("schemaVersion")) is not int
        or manifest["schemaVersion"] != 1
        or not isinstance(manifest.get("sourceRevision"), str)
        or not manifest["sourceRevision"].strip()
        or not isinstance(manifest.get("files"), dict)
    ):
        raise RuntimeError(f"{site} artifact manifest is invalid")
    for suffix in ("polygon_inventory", "findspot_polygon_mappings"):
        name = f"{site}_{suffix}.json"
        actual = hashlib.sha256((artifact_dir / name).read_bytes()).hexdigest()
        if manifest["files"].get(name) != actual:
            raise RuntimeError(f"{site} artifact manifest checksum disagrees with {name}")
    return {
        "artifactSourceRevision": manifest["sourceRevision"],
        "artifactManifestSha256": hashlib.sha256(contents).hexdigest(),
    }


def build_manifest(
    collections: dict[str, dict[str, Any]],
    all_sites: dict[str, Any],
    artifact_dir: Path,
) -> dict[str, Any]:
    files = {
        f"{name}.geojson": hashlib.sha256(json_bytes(collection)).hexdigest()
        for name, collection in {**collections, "all": all_sites}.items()
    }
    sites: dict[str, Any] = {}
    for site, collection in collections.items():
        mappings = json.loads(
            (artifact_dir / f"{site}_findspot_polygon_mappings.json").read_text(
                encoding="utf-8"
            )
        )
        sites[site.upper()] = {
            "polygonCount": len(collection["features"]),
            "mappingCount": len(mappings),
            "mappedPolygonCount": len(
                {polygon_id for row in mappings for polygon_id in row["polygonIds"]}
            ),
            "mappingSourceRevisions": sorted(
                {row["sourceRevision"] for row in mappings}
            ),
            "mappingSources": sorted({row["source"] for row in mappings}),
            **_input_revision(artifact_dir, site),
        }
    return {"schemaVersion": 1, "algorithm": "sha256", "files": files, "sites": sites}
