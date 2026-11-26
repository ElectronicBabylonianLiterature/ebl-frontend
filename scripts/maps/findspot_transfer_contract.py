from __future__ import annotations

from dataclasses import dataclass
import hashlib
import json
from pathlib import Path
import re
from typing import Any

from findspot_artifact_validation import SITE_NAMES
from findspot_json import load_json

CONTRACT_NAME = "ARTIFACT_MANIFEST.json"
CONTRACT_VERSION = "ebl-map-metadata/1"
SUFFIXES = ("polygon_inventory", "findspot_polygon_mappings")


@dataclass(frozen=True)
class TransferContract:
    payload: dict[str, Any]
    sha256: str


def _require(condition: bool, message: str) -> None:
    if not condition:
        raise RuntimeError(f"Transfer contract {message}")


def _validate_header(payload: dict[str, Any]) -> None:
    _require(type(payload.get("schemaVersion")) is int, "schema is invalid")
    _require(payload["schemaVersion"] == 1, "schema is unsupported")
    expected = {
        "contractVersion": CONTRACT_VERSION,
        "geometryContractVersion": "ebl-excavation-polygons/1",
        "canonicalCrs": "EPSG:4326",
        "generatorVersion": "map_artifact_generator/3",
    }
    for field, value in expected.items():
        _require(payload.get(field) == value, f"{field} is unsupported")
    _require(payload.get("geometryIncluded") is False, "must omit geometry")
    producer = payload.get("producer")
    _require(isinstance(producer, dict), "producer is invalid")
    _require(
        producer.get("repository") == "ElectronicBabylonianLiterature/ebl-api",
        "producer repository is unsupported",
    )
    _require(
        isinstance(producer.get("commit"), str)
        and re.fullmatch(r"[0-9a-f]{40}", producer["commit"]) is not None,
        "producer revision is invalid",
    )
    _require(type(producer.get("dirtyWorktree")) is bool, "producer state is invalid")


def _validate_digest(payload: dict[str, Any]) -> None:
    stable = {
        key: value
        for key, value in payload.items()
        if key not in {"producer", "contractRevision"}
    }
    canonical = json.dumps(
        stable, sort_keys=True, separators=(",", ":"), ensure_ascii=False
    ).encode("utf-8")
    expected = "sha256:" + hashlib.sha256(canonical).hexdigest()
    _require(payload.get("contractRevision") == expected, "content digest disagrees")


def _validated_files(artifact_dir: Path, payload: dict[str, Any]) -> dict[str, bytes]:
    names = {f"{site}_{suffix}.json" for site in SITE_NAMES for suffix in SUFFIXES}
    checksums = payload.get("fileChecksums")
    _require(isinstance(checksums, dict), "file checksums are invalid")
    _require(set(checksums) == names, "must name exactly the eight metadata files")
    contents = {name: (artifact_dir / name).read_bytes() for name in names}
    for name, content in contents.items():
        _require(
            checksums[name] == hashlib.sha256(content).hexdigest(),
            f"checksum disagrees with {name}",
        )
    return contents


def _rows(contents: dict[str, bytes], site: str, suffix: str) -> list[dict[str, Any]]:
    rows = load_json(contents[f"{site}_{suffix}.json"])
    _require(
        isinstance(rows, list) and all(isinstance(row, dict) for row in rows),
        f"{site} metadata is invalid",
    )
    return rows


def _validate_site(
    site: str,
    payload: dict[str, Any],
    contents: dict[str, bytes],
) -> None:
    summary = payload["sites"][site.upper()]
    _require(isinstance(summary, dict), f"{site} summary is invalid")
    _require(summary.get("siteId") == site.upper(), f"{site} identity disagrees")
    _require(summary.get("siteName") == SITE_NAMES[site], f"{site} name disagrees")
    for field in ("sourceRevision", "authoritativeSource", "sourceCrs"):
        value = summary.get(field)
        _require(
            isinstance(value, str) and bool(value.strip()), f"{site} {field} is invalid"
        )
    counts = (
        "polygonCount",
        "mappingCount",
        "distinctMappedPolygonCount",
        "unresolvedCount",
    )
    for field in counts:
        value = summary.get(field)
        _require(type(value) is int and value >= 0, f"{site} {field} is invalid")
    inventory = _rows(contents, site, "polygon_inventory")
    mappings = _rows(contents, site, "findspot_polygon_mappings")
    mapped = {polygon_id for row in mappings for polygon_id in row["polygonIds"]}
    actual = {
        "features": len(inventory),
        "inventory": len(inventory),
        "mappings": len(mappings),
        "mapped": len(mapped),
    }
    _require(payload["expectations"][site] == actual, f"{site} expectations disagree")
    _require(
        summary["polygonCount"] == actual["inventory"],
        f"{site} polygon count disagrees",
    )
    _require(
        summary["mappingCount"] == actual["mappings"], f"{site} mapping count disagrees"
    )
    _require(
        summary["distinctMappedPolygonCount"] == actual["mapped"],
        f"{site} mapped count disagrees",
    )
    _require(
        all(row.get("sourceRevision") == summary["sourceRevision"] for row in mappings),
        f"{site} mapping revisions disagree",
    )


def load_transfer_contract(artifact_dir: Path) -> TransferContract | None:
    path = artifact_dir / CONTRACT_NAME
    if not path.exists():
        return None
    contents = path.read_bytes()
    payload = load_json(contents)
    _require(isinstance(payload, dict), "must be an object")
    _validate_header(payload)
    _validate_digest(payload)
    sites = payload.get("sites")
    _require(isinstance(sites, dict), "sites are invalid")
    _require(set(sites) == {site.upper() for site in SITE_NAMES}, "sites disagree")
    expectations = payload.get("expectations")
    _require(isinstance(expectations, dict), "expectations are invalid")
    _require(set(expectations) == set(SITE_NAMES), "expectation sites disagree")
    metadata = _validated_files(artifact_dir, payload)
    for site in SITE_NAMES:
        _validate_site(site, payload, metadata)
    return TransferContract(payload, hashlib.sha256(contents).hexdigest())
