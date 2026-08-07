#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
import tempfile
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_FINDSPOT_DIR = ROOT / 'public' / 'map-data' / 'findspots'
DEFAULT_INVENTORY = ROOT / '.map-processing' / 'backend-artifacts' / 'assur_polygon_inventory.json'
DEFAULT_MAPPING = ROOT / '.map-processing' / 'backend-artifacts' / 'assur_findspot_polygon_mappings.json'
SITES = ('assur', 'kalhu', 'nippur', 'uruk')
LEGACY_ASSUR_ID = re.compile(r'^assur-\d+$')

# Production guard rails. Overridable only so the generator contract can be
# exercised with small synthetic fixtures; the defaults are the committed
# canonical asset guarantees.
DEFAULT_EXPECTATIONS = {
    'siteFeatureCounts': {'assur': 134, 'kalhu': 12, 'nippur': 20, 'uruk': 128},
    'inventoryCount': 134,
    'mappingCount': 317,
    'mappedPolygonCount': 133,
}


def load_expectations(path: Path | None) -> dict[str, Any]:
    if path is None:
        return DEFAULT_EXPECTATIONS
    overrides = read_json(path)
    if not isinstance(overrides, dict):
        raise RuntimeError('Expectations file must be a JSON object')
    return {**DEFAULT_EXPECTATIONS, **overrides}


def read_json(path: Path) -> Any:
    return json.loads(path.read_text())


def write_json(path: Path, value: Any) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, separators=(',', ':')))


def source_key(value: object) -> str:
    return str(value).strip()


def load_inventory(path: Path, expected_count: int) -> dict[str, str]:
    records = read_json(path)
    if not isinstance(records, list):
        raise RuntimeError('Aššur polygon inventory must be a JSON list')
    by_name: dict[str, str] = {}
    seen_ids: set[str] = set()
    for index, record in enumerate(records, start=1):
        if not isinstance(record, dict):
            raise RuntimeError(f'Inventory row {index} is not an object')
        polygon_id = record.get('polygonId')
        name = record.get('name')
        if not isinstance(polygon_id, str) or not polygon_id.startswith('assur-'):
            raise RuntimeError(f'Inventory row {index} has invalid polygonId')
        if LEGACY_ASSUR_ID.fullmatch(polygon_id):
            raise RuntimeError(f'Inventory row {index} has legacy polygonId')
        if not isinstance(name, str) or not name.strip():
            raise RuntimeError(f'Inventory row {index} has invalid name')
        if polygon_id in seen_ids:
            raise RuntimeError(f'Duplicate inventory polygonId: {polygon_id}')
        key = source_key(name)
        if key in by_name:
            raise RuntimeError(f'Ambiguous inventory source name: {name}')
        seen_ids.add(polygon_id)
        by_name[key] = polygon_id
    if len(by_name) != expected_count:
        raise RuntimeError(f'Expected {expected_count} inventory records, found {len(by_name)}')
    return by_name


def load_mapping(path: Path, inventory_ids: set[str], expected_records: int, expected_mapped: int) -> set[str]:
    records = read_json(path)
    if not isinstance(records, list):
        raise RuntimeError('Aššur mapping artifact must be a JSON list')
    findspot_ids: set[int] = set()
    mapped_ids: set[str] = set()
    for index, record in enumerate(records, start=1):
        if not isinstance(record, dict):
            raise RuntimeError(f'Mapping row {index} is not an object')
        findspot_id = record.get('findspotId')
        polygon_ids = record.get('polygonIds')
        if not isinstance(findspot_id, int):
            raise RuntimeError(f'Mapping row {index} has invalid findspotId')
        if findspot_id in findspot_ids:
            raise RuntimeError(f'Duplicate mapping findspotId: {findspot_id}')
        if not isinstance(polygon_ids, list) or not polygon_ids:
            raise RuntimeError(f'Mapping row {index} has invalid polygonIds')
        if len(polygon_ids) != len(set(polygon_ids)):
            raise RuntimeError(f'Mapping row {index} duplicates a polygonId')
        missing = [item for item in polygon_ids if item not in inventory_ids]
        if missing:
            raise RuntimeError(f'Mapping row {index} references unknown polygonIds: {missing}')
        findspot_ids.add(findspot_id)
        mapped_ids.update(polygon_ids)
    if len(records) != expected_records:
        raise RuntimeError(f'Expected {expected_records} mapping records, found {len(records)}')
    if len(findspot_ids) != expected_records:
        raise RuntimeError(f'Expected {expected_records} unique findspot IDs, found {len(findspot_ids)}')
    if len(mapped_ids) != expected_mapped:
        raise RuntimeError(f'Expected {expected_mapped} mapped polygon IDs, found {len(mapped_ids)}')
    return mapped_ids


def validate_site_counts(collections: dict[str, dict[str, Any]], expected_counts: dict[str, int]) -> None:
    for site, expected in expected_counts.items():
        features = collections[site].get('features')
        if collections[site].get('type') != 'FeatureCollection' or not isinstance(features, list):
            raise RuntimeError(f'{site}.geojson is not a FeatureCollection')
        if len(features) != expected:
            raise RuntimeError(f'{site}.geojson expected {expected} features, found {len(features)}')


def canonicalize_assur(collection: dict[str, Any], inventory: dict[str, str], mapped_ids: set[str]) -> dict[str, Any]:
    matched: set[str] = set()
    canonical_ids: set[str] = set()
    features = []
    for index, feature in enumerate(collection['features'], start=1):
        props = dict(feature.get('properties') or {})
        name = props.get('name')
        if not isinstance(name, str):
            raise RuntimeError(f'Aššur feature {index} has no source name')
        key = source_key(name)
        polygon_id = inventory.get(key)
        if polygon_id is None:
            raise RuntimeError(f'Missing inventory match for Aššur source name: {name}')
        if key in matched:
            raise RuntimeError(f'Ambiguous frontend Aššur source name: {name}')
        if polygon_id in canonical_ids:
            raise RuntimeError(f'Duplicate generated canonical ID: {polygon_id}')
        matched.add(key)
        canonical_ids.add(polygon_id)
        props['id'] = polygon_id
        features.append({**feature, 'id': polygon_id, 'properties': props})
    unused = sorted(set(inventory) - matched)
    if unused:
        raise RuntimeError(f'Unused inventory source names: {unused}')
    missing_mapped = sorted(mapped_ids - canonical_ids)
    if missing_mapped:
        raise RuntimeError(f'Mapped polygon IDs missing from generated Aššur GeoJSON: {missing_mapped}')
    return {'type': 'FeatureCollection', 'features': features}


def build_assets(findspot_dir: Path, inventory_path: Path, mapping_path: Path, expectations: dict[str, Any] | None = None) -> tuple[dict[str, Any], dict[str, Any]]:
    resolved = expectations or DEFAULT_EXPECTATIONS
    collections = {site: read_json(findspot_dir / f'{site}.geojson') for site in SITES}
    validate_site_counts(collections, resolved['siteFeatureCounts'])
    inventory = load_inventory(inventory_path, resolved['inventoryCount'])
    mapped_ids = load_mapping(mapping_path, set(inventory.values()), resolved['mappingCount'], resolved['mappedPolygonCount'])
    assur = canonicalize_assur(collections['assur'], inventory, mapped_ids)
    all_features = [feature for site in SITES for feature in (assur if site == 'assur' else collections[site])['features']]
    return assur, {'type': 'FeatureCollection', 'features': all_features}


def atomic_write_outputs(findspot_dir: Path, assur: dict[str, Any], all_sites: dict[str, Any]) -> None:
    with tempfile.TemporaryDirectory(dir=findspot_dir) as tmp:
        tmpdir = Path(tmp)
        assur_tmp = tmpdir / 'assur.geojson'
        all_tmp = tmpdir / 'all.geojson'
        write_json(assur_tmp, assur)
        write_json(all_tmp, all_sites)
        assur_tmp.replace(findspot_dir / 'assur.geojson')
        all_tmp.replace(findspot_dir / 'all.geojson')


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description='Build canonical findspot map GeoJSON assets.')
    parser.add_argument('--findspot-dir', type=Path, default=DEFAULT_FINDSPOT_DIR)
    parser.add_argument('--polygon-inventory', type=Path, default=DEFAULT_INVENTORY)
    parser.add_argument('--mapping-artifact', type=Path, default=DEFAULT_MAPPING)
    parser.add_argument('--expectations', type=Path, default=None)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    assur, all_sites = build_assets(args.findspot_dir, args.polygon_inventory, args.mapping_artifact, load_expectations(args.expectations))
    atomic_write_outputs(args.findspot_dir, assur, all_sites)
    print(json.dumps({'assurFeatureCount': len(assur['features']), 'allFeatureCount': len(all_sites['features'])}, sort_keys=True))


if __name__ == '__main__':
    main()
