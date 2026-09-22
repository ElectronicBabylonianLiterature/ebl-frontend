from __future__ import annotations

import hashlib
import re
import unicodedata


def _format_coordinate(value: float) -> str:
    return format(value, ".15f").rstrip("0").rstrip(".")


def _serialize_ring(ring: list[list[float]]) -> str:
    return ";".join(
        f"{_format_coordinate(point[0])},{_format_coordinate(point[1])}"
        for point in ring
    )


def _canonical_ring(value: object) -> list[list[float]]:
    if not isinstance(value, list) or len(value) < 4 or value[0] != value[-1]:
        raise RuntimeError("Polygon rings must be explicitly closed")
    vertices = value[:-1]
    if any(
        not isinstance(point, list)
        or len(point) != 2
        or any(
            isinstance(item, bool)
            or not isinstance(item, (int, float))
            or not abs(float(item)) < float("inf")
            for item in point
        )
        for point in vertices
    ):
        raise RuntimeError("Polygon coordinates must be finite numeric pairs")
    if any(not (-180 <= point[0] <= 180 and -90 <= point[1] <= 90) for point in vertices):
        raise RuntimeError("Polygon coordinates fall outside EPSG:4326 bounds")
    if len({tuple(point) for point in vertices}) < 3:
        raise RuntimeError("Polygon rings require three distinct points")
    candidates = [
        vertices[index:] + vertices[:index] for index in range(len(vertices))
    ]
    reversed_vertices = list(reversed(vertices))
    candidates.extend(
        reversed_vertices[index:] + reversed_vertices[:index]
        for index in range(len(reversed_vertices))
    )
    best = min(candidates, key=_serialize_ring)
    return best + [best[0]]


def polygon_id(site: str, name: str, checksum: str) -> str:
    if any(unicodedata.category(character) == "Cc" for character in name):
        raise RuntimeError("Polygon name contains a control character")
    slug = re.sub(
        r"[^a-z0-9]+",
        "-",
        unicodedata.normalize("NFKC", name).casefold(),
    ).strip("-")
    if not slug:
        slug = "u" + "-".join(f"{ord(character):04x}" for character in name)
    return f"{site}-{slug}-{checksum}"


def area_name(name: str) -> str:
    return re.sub(r"^\d+", "", unicodedata.normalize("NFKC", name).strip())


def geometry_checksum(geometry: object) -> str:
    if not isinstance(geometry, dict) or geometry.get("type") != "Polygon":
        raise RuntimeError("Only Polygon geometry is supported")
    coordinates = geometry.get("coordinates")
    if not isinstance(coordinates, list) or not coordinates:
        raise RuntimeError("Polygon must contain at least one ring")
    canonical = sorted(
        _serialize_ring(_canonical_ring(ring)) for ring in coordinates
    )
    return hashlib.sha1("|".join(canonical).encode("utf-8")).hexdigest()[:12]
