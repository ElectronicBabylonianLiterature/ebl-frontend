from __future__ import annotations

import argparse
import importlib.util
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

SCRIPT = Path(__file__).with_name("build-findspot-map-assets.py")
SPEC = importlib.util.spec_from_file_location("map_assets", SCRIPT)
assert SPEC is not None and SPEC.loader is not None
ASSETS = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(ASSETS)


class FindspotMapHandoffTest(unittest.TestCase):
    artifact_source: Path
    geometry_source: Path

    def setUp(self) -> None:
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        directory = Path(temporary.name)
        self.artifacts = directory / "artifacts"
        self.geometry = directory / "geometry"
        self.artifacts.mkdir()
        self.geometry.mkdir()
        for site in ASSETS.SITES:
            shutil.copyfile(
                self.geometry_source / f"{site}.geojson",
                self.geometry / f"{site}.geojson",
            )
            for suffix in ("polygon_inventory", "findspot_polygon_mappings"):
                name = f"{site}_{suffix}.json"
                shutil.copyfile(self.artifact_source / name, self.artifacts / name)

    def generate(self) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            [
                sys.executable,
                str(SCRIPT),
                "--findspot-dir",
                str(self.geometry),
                "--artifact-dir",
                str(self.artifacts),
            ],
            capture_output=True,
            text=True,
            check=False,
        )

    def outputs(self) -> dict[str, bytes]:
        return {path.name: path.read_bytes() for path in self.geometry.iterdir()}

    def test_defaults_accept_canonical_metadata_and_preserve_geometry(self) -> None:
        result = self.generate()
        self.assertEqual(result.returncode, 0, result.stderr)
        expected_features = []
        for site in ASSETS.SITES:
            original = ASSETS.read_json(self.geometry_source / f"{site}.geojson")
            actual = ASSETS.read_json(self.geometry / f"{site}.geojson")
            inventory = ASSETS.read_json(
                self.artifacts / f"{site}_polygon_inventory.json"
            )
            self.assertEqual(
                [feature["geometry"] for feature in actual["features"]],
                [feature["geometry"] for feature in original["features"]],
            )
            self.assertEqual(
                {feature["id"] for feature in actual["features"]},
                {record["polygonId"] for record in inventory},
            )
            expected_features.extend(actual["features"])
        self.assertEqual(
            ASSETS.read_json(self.geometry / "all.geojson")["features"],
            expected_features,
        )

    def test_repeat_generation_is_byte_identical(self) -> None:
        first = self.generate()
        self.assertEqual(first.returncode, 0, first.stderr)
        original = self.outputs()
        second = self.generate()
        self.assertEqual(second.returncode, 0, second.stderr)
        self.assertEqual(second.stdout, first.stdout)
        self.assertEqual(self.outputs(), original)

    def test_invalid_last_site_does_not_replace_any_output(self) -> None:
        result = self.generate()
        self.assertEqual(result.returncode, 0, result.stderr)
        original = self.outputs()
        path = self.artifacts / f"{ASSETS.SITES[-1]}_findspot_polygon_mappings.json"
        mappings = ASSETS.read_json(path)
        mappings[0]["polygonIds"] = ["missing-polygon"]
        path.write_text(json.dumps(mappings), encoding="utf-8")
        result = self.generate()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("unknown polygonIds", result.stderr)
        self.assertEqual(self.outputs(), original)

    def test_cross_site_findspot_reuse_is_rejected(self) -> None:
        first, second = ASSETS.SITES[:2]
        first_mappings = ASSETS.read_json(
            self.artifacts / f"{first}_findspot_polygon_mappings.json"
        )
        path = self.artifacts / f"{second}_findspot_polygon_mappings.json"
        second_mappings = ASSETS.read_json(path)
        second_mappings[0]["findspotId"] = first_mappings[0]["findspotId"]
        path.write_text(json.dumps(second_mappings), encoding="utf-8")
        original = self.outputs()
        result = self.generate()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("reuse global findspot IDs", result.stderr)
        self.assertEqual(self.outputs(), original)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Verify frontend generation against the canonical backend handoff."
    )
    parser.add_argument("--artifact-dir", type=Path, required=True)
    parser.add_argument("--findspot-dir", type=Path, required=True)
    args, unittest_args = parser.parse_known_args()
    FindspotMapHandoffTest.artifact_source = args.artifact_dir.resolve()
    FindspotMapHandoffTest.geometry_source = args.findspot_dir.resolve()
    unittest.main(argv=[sys.argv[0], *unittest_args])
