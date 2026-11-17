from __future__ import annotations

import argparse
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_ARTIFACT_DIR = ROOT / ".map-processing" / "backend-artifacts"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Build canonical multi-site findspot map GeoJSON assets from the backend "
            "metadata transfer and the four site geometry files. Validates content "
            "hashes, canonical polygon IDs and counts before atomically publishing "
            "the five GeoJSON files and manifest.json. Geometry is preserved."
        ),
        epilog=(
            "Keep extracted transfers in .map-processing/backend-artifacts. Run "
            "test_findspot_map_handoff.py first against the same directories. "
            "Use --expectations only for an explicitly reviewed alternate dataset. "
            "When research exports are present, also update the bundled artifact "
            "provenance from the published manifest."
        ),
    )
    parser.add_argument(
        "--findspot-dir",
        type=Path,
        required=True,
        help="Directory containing assur/kalhu/nippur/uruk.geojson.",
    )
    parser.add_argument(
        "--artifact-dir",
        type=Path,
        default=DEFAULT_ARTIFACT_DIR,
        help="Extracted backend inventories, mappings and transfer manifest.",
    )
    parser.add_argument(
        "--expectations",
        type=Path,
        help="Reviewed alternative per-site counts; canonical counts are the default.",
    )
    return parser.parse_args()
