#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import tempfile
import unicodedata
from pathlib import Path
from typing import Any

from findspot_artifact_validation import load_inventory, load_mapping
from findspot_geometry_identity import geometry_checksum

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_ARTIFACT_DIR = ROOT / ".map-processing" / "backend-artifacts"
SITES = ("assur", "kalhu", "nippur", "uruk")
DEFAULT_EXPECTATIONS = {
    "assur": {"features": 134, "inventory": 134, "mappings": 317, "mapped": 133},
    "kalhu": {"features": 12, "inventory": 12, "mappings": 8, "mapped": 8},
    "nippur": {"features": 20, "inventory": 20, "mappings": 20, "mapped": 9},
    "uruk": {"features": 128, "inventory": 128, "mappings": 131, "mapped": 126},
}


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, value: Any) -> None:
    path.write_text(
        json.dumps(value, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )


def load_expectations(path: Path | None) -> dict[str, dict[str, int]]:
    value = DEFAULT_EXPECTATIONS if path is None else read_json(path)
    if not isinstance(value, dict) or set(value) != set(SITES):
        raise RuntimeError("Expectations must define exactly the configured sites")
    for site, counts in value.items():
        if not isinstance(counts, dict) or set(counts) != {
            "features",
            "inventory",
            "mappings",
            "mapped",
        }:
            raise RuntimeError(f"Invalid expectations for {site}")
        if any(not isinstance(count, int) or count < 0 for count in counts.values()):
            raise RuntimeError(f"Invalid expectation count for {site}")
    return value


def source_key(value: str) -> str:
    return unicodedata.normalize("NFKC", value).strip()


def canonicalize_site(
    collection: object,
    site: str,
    inventory: dict[str, dict[str, str]],
    mapped_ids: set[str],
    expected_features: int,
) -> dict[str, Any]:
    if not isinstance(collection, dict) or collection.get("type") != "FeatureCollection":
        raise RuntimeError(f"{site}.geojson is not a FeatureCollection")
    source_features = collection.get("features")
    if not isinstance(source_features, list) or len(source_features) != expected_features:
        raise RuntimeError(f"{site}.geojson must contain {expected_features} features")
    canonical_ids: set[str] = set()
    features: list[dict[str, Any]] = []
    for index, feature in enumerate(source_features, start=1):
        if not isinstance(feature, dict) or not isinstance(feature.get("properties"), dict):
            raise RuntimeError(f"{site} feature {index} is invalid")
        checksum = geometry_checksum(feature.get("geometry"))
        record = inventory.get(checksum)
        if record is None:
            raise RuntimeError(f"{site} feature {index} has no geometry inventory match")
        properties = feature["properties"]
        name = properties.get("name")
        if properties.get("siteId") != site:
            raise RuntimeError(f"{site} feature {index} has the wrong siteId")
        if properties.get("siteName") != record["siteName"]:
            raise RuntimeError(f"{site} feature {index} has the wrong siteName")
        if not isinstance(name, str) or source_key(name) != source_key(record["name"]):
            raise RuntimeError(f"{site} feature {index} disagrees with inventory name")
        polygon_id = record["polygonId"]
        if polygon_id in canonical_ids:
            raise RuntimeError(f"{site} frontend geometry duplicates {polygon_id}")
        canonical_ids.add(polygon_id)
        properties = {**feature["properties"], "id": polygon_id}
        features.append({**feature, "id": polygon_id, "properties": properties})
    if canonical_ids != {record["polygonId"] for record in inventory.values()}:
        raise RuntimeError(f"{site} inventory and frontend geometry are not one-to-one")
    if not mapped_ids <= canonical_ids:
        raise RuntimeError(f"{site} mapped polygons are missing from frontend geometry")
    return {"type": "FeatureCollection", "features": features}


def build_assets(
    findspot_dir: Path,
    artifact_dir: Path,
    expectations: dict[str, dict[str, int]],
) -> tuple[dict[str, dict[str, Any]], dict[str, Any]]:
    collections: dict[str, dict[str, Any]] = {}
    all_findspot_ids: set[int] = set()
    for site in SITES:
        counts = expectations[site]
        inventory, inventory_ids = load_inventory(
            artifact_dir / f"{site}_polygon_inventory.json", site, counts["inventory"]
        )
        mapped_ids, findspot_ids = load_mapping(
            artifact_dir / f"{site}_findspot_polygon_mappings.json",
            site,
            inventory_ids,
            counts["mappings"],
            counts["mapped"],
        )
        duplicate_findspot_ids = all_findspot_ids & findspot_ids
        if duplicate_findspot_ids:
            raise RuntimeError(
                f"{site} mappings reuse global findspot IDs: "
                f"{sorted(duplicate_findspot_ids)}"
            )
        all_findspot_ids.update(findspot_ids)
        collections[site] = canonicalize_site(
            read_json(findspot_dir / f"{site}.geojson"),
            site,
            inventory,
            mapped_ids,
            counts["features"],
        )
    all_features = [
        feature for site in SITES for feature in collections[site]["features"]
    ]
    return collections, {"type": "FeatureCollection", "features": all_features}


def atomic_write_outputs(
    findspot_dir: Path,
    collections: dict[str, dict[str, Any]],
    all_sites: dict[str, Any],
) -> None:
    with tempfile.TemporaryDirectory(dir=findspot_dir) as temporary:
        temporary_dir = Path(temporary)
        outputs = {**collections, "all": all_sites}
        output_paths = {
            name: findspot_dir / f"{name}.geojson" for name in outputs
        }
        originals = {
            name: path.read_bytes() if path.exists() else None
            for name, path in output_paths.items()
        }
        for name, collection in outputs.items():
            write_json(temporary_dir / f"{name}.geojson", collection)
        committed: list[str] = []
        try:
            for name, output_path in output_paths.items():
                (temporary_dir / f"{name}.geojson").replace(output_path)
                committed.append(name)
        except OSError:
            for name in committed:
                original = originals[name]
                if original is None:
                    output_paths[name].unlink(missing_ok=True)
                else:
                    output_paths[name].write_bytes(original)
            raise


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Build canonical multi-site findspot map GeoJSON assets."
    )
    parser.add_argument("--findspot-dir", type=Path, required=True)
    parser.add_argument("--artifact-dir", type=Path, default=DEFAULT_ARTIFACT_DIR)
    parser.add_argument("--expectations", type=Path)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    expectations = load_expectations(args.expectations)
    collections, all_sites = build_assets(
        args.findspot_dir, args.artifact_dir, expectations
    )
    atomic_write_outputs(args.findspot_dir, collections, all_sites)
    print(
        json.dumps(
            {
                "siteFeatureCounts": {
                    site: len(collection["features"])
                    for site, collection in collections.items()
                },
                "allFeatureCount": len(all_sites["features"]),
            },
            sort_keys=True,
        )
    )


if __name__ == "__main__":
    main()
