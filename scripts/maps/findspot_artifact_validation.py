from __future__ import annotations

import json
from pathlib import Path

from findspot_geometry_identity import area_name, polygon_id as build_polygon_id

SITE_NAMES = {
    "assur": "Aššur",
    "kalhu": "Kalḫu",
    "nippur": "Nippur",
    "uruk": "Uruk",
}


def _read_json(path: Path) -> object:
    return json.loads(path.read_text(encoding="utf-8"))


def load_inventory(
    path: Path, site: str, expected: int
) -> tuple[dict[str, dict[str, str]], set[str]]:
    records = _read_json(path)
    if not isinstance(records, list) or len(records) != expected:
        raise RuntimeError(f"{site} inventory must contain {expected} rows")
    by_checksum: dict[str, dict[str, str]] = {}
    polygon_ids: set[str] = set()
    for index, record in enumerate(records, start=1):
        if not isinstance(record, dict):
            raise RuntimeError(f"{site} inventory row {index} is not an object")
        polygon_id = record.get("polygonId")
        checksum = record.get("geometryChecksum")
        name = record.get("name")
        if record.get("siteId") != site.upper():
            raise RuntimeError(f"{site} inventory row {index} has the wrong siteId")
        site_name = record.get("siteName")
        record_area_name = record.get("areaName")
        required_strings = (polygon_id, checksum, name, site_name, record_area_name)
        if not all(
            isinstance(item, str) and item.strip() for item in required_strings
        ):
            raise RuntimeError(f"{site} inventory row {index} is invalid")
        if site_name != SITE_NAMES[site] or area_name(name) != record_area_name:
            raise RuntimeError(f"{site} inventory row {index} has invalid labels")
        if build_polygon_id(site, name, checksum) != polygon_id:
            raise RuntimeError(f"{site} inventory row {index} has an invalid polygonId")
        if polygon_id in polygon_ids or checksum in by_checksum:
            raise RuntimeError(f"{site} inventory contains duplicate identity")
        polygon_ids.add(polygon_id)
        by_checksum[checksum] = record
    return by_checksum, polygon_ids


def load_mapping(
    path: Path,
    site: str,
    inventory_ids: set[str],
    expected_rows: int,
    expected_mapped: int,
) -> tuple[set[str], set[int]]:
    records = _read_json(path)
    if not isinstance(records, list) or len(records) != expected_rows:
        raise RuntimeError(f"{site} mappings must contain {expected_rows} rows")
    findspot_ids: set[int] = set()
    mapped_ids: set[str] = set()
    for index, record in enumerate(records, start=1):
        if not isinstance(record, dict):
            raise RuntimeError(f"{site} mapping row {index} is not an object")
        findspot_id = record.get("findspotId")
        polygon_ids = record.get("polygonIds")
        if (
            isinstance(findspot_id, bool)
            or not isinstance(findspot_id, int)
            or findspot_id < 0
        ):
            raise RuntimeError(f"{site} mapping row {index} has invalid findspotId")
        if findspot_id in findspot_ids:
            raise RuntimeError(f"{site} mappings duplicate findspotId {findspot_id}")
        if not isinstance(polygon_ids, list) or not polygon_ids:
            raise RuntimeError(f"{site} mapping row {index} has invalid polygonIds")
        if any(not isinstance(item, str) for item in polygon_ids):
            raise RuntimeError(f"{site} mapping row {index} has invalid polygonIds")
        if len(polygon_ids) != len(set(polygon_ids)):
            raise RuntimeError(f"{site} mapping row {index} duplicates a polygonId")
        if any(item not in inventory_ids for item in polygon_ids):
            raise RuntimeError(f"{site} mapping row {index} has unknown polygonIds")
        if record.get("locationPrecision") != "excavation-area":
            raise RuntimeError(f"{site} mapping row {index} has invalid precision")
        if record.get("matchMethod") not in {"verified-source", "curated"}:
            raise RuntimeError(f"{site} mapping row {index} has invalid matchMethod")
        if any(
            not isinstance(record.get(field), str) or not record[field].strip()
            for field in ("source", "sourceRevision")
        ):
            raise RuntimeError(f"{site} mapping row {index} has invalid provenance")
        findspot_ids.add(findspot_id)
        mapped_ids.update(polygon_ids)
    if len(mapped_ids) != expected_mapped:
        raise RuntimeError(f"{site} mappings must reference {expected_mapped} polygons")
    return mapped_ids, findspot_ids
