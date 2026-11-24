from __future__ import annotations

import argparse
import hashlib
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
    expectations: Path | None = None

    def setUp(self) -> None:
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        directory = Path(temporary.name)
        self.artifacts = directory / "artifacts"
        self.geometry = directory / "geometry"
        self.artifacts.mkdir()
        self.geometry.mkdir()
        contract = self.artifact_source / "ARTIFACT_MANIFEST.json"
        if contract.exists():
            shutil.copyfile(contract, self.artifacts / contract.name)
        for site in ASSETS.SITES:
            shutil.copyfile(
                self.geometry_source / f"{site}.geojson",
                self.geometry / f"{site}.geojson",
            )
            for suffix in ("polygon_inventory", "findspot_polygon_mappings"):
                name = f"{site}_{suffix}.json"
                shutil.copyfile(self.artifact_source / name, self.artifacts / name)
            manifest = self.artifact_source / f"{site}_artifact_manifest.json"
            if manifest.exists():
                shutil.copyfile(manifest, self.artifacts / manifest.name)

    def generate(self) -> subprocess.CompletedProcess[str]:
        command = [
            sys.executable,
            str(SCRIPT),
            "--findspot-dir",
            str(self.geometry),
            "--artifact-dir",
            str(self.artifacts),
        ]
        if self.expectations is not None:
            command.extend(["--expectations", str(self.expectations)])
        return subprocess.run(
            command,
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
            supplied_manifest = self.artifact_source / f"{site}_artifact_manifest.json"
            contract = self.artifact_source / "ARTIFACT_MANIFEST.json"
            if contract.exists():
                output_manifest = ASSETS.read_json(self.geometry / "manifest.json")
                source = ASSETS.read_json(contract)
                revision = output_manifest["sites"][site.upper()]
                self.assertEqual(
                    revision["artifactSourceRevision"],
                    source["sites"][site.upper()]["sourceRevision"],
                )
                self.assertEqual(
                    revision["artifactContractRevision"], source["contractRevision"]
                )
                self.assertEqual(
                    revision["artifactManifestSha256"],
                    hashlib.sha256(contract.read_bytes()).hexdigest(),
                )
            elif supplied_manifest.exists():
                output_manifest = ASSETS.read_json(self.geometry / "manifest.json")
                revision = output_manifest["sites"][site.upper()]
                self.assertEqual(
                    revision["artifactSourceRevision"],
                    ASSETS.read_json(supplied_manifest)["sourceRevision"],
                )
                self.assertEqual(
                    revision["artifactManifestSha256"],
                    hashlib.sha256(supplied_manifest.read_bytes()).hexdigest(),
                )
            expected_features.extend(actual["features"])
        self.assertEqual(
            ASSETS.read_json(self.geometry / "all.geojson")["features"],
            expected_features,
        )

    def test_tampered_supplied_manifest_preserves_all_outputs(self) -> None:
        site = ASSETS.SITES[0]
        contract_path = self.artifacts / "ARTIFACT_MANIFEST.json"
        if contract_path.exists():
            manifest = ASSETS.read_json(contract_path)
            manifest["fileChecksums"][f"{site}_polygon_inventory.json"] = "0" * 64
            stable = {
                key: value
                for key, value in manifest.items()
                if key not in {"producer", "contractRevision"}
            }
            canonical = json.dumps(
                stable, sort_keys=True, separators=(",", ":"), ensure_ascii=False
            )
            manifest["contractRevision"] = (
                "sha256:" + hashlib.sha256(canonical.encode()).hexdigest()
            )
            contract_path.write_text(json.dumps(manifest), encoding="utf-8")
        else:
            self.tamper_site_manifest(site)
        original = self.outputs()
        result = self.generate()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("checksum disagrees", result.stderr)
        self.assertEqual(self.outputs(), original)

    def tamper_site_manifest(self, site: str) -> None:
        path = self.artifacts / f"{site}_artifact_manifest.json"
        manifest = (
            ASSETS.read_json(path)
            if path.exists()
            else {
                "schemaVersion": 1,
                "sourceRevision": "handoff-regression",
                "files": {
                    item.name: hashlib.sha256(item.read_bytes()).hexdigest()
                    for item in self.artifacts.iterdir()
                    if item.name.startswith(f"{site}_")
                },
            }
        )
        manifest["files"][f"{site}_polygon_inventory.json"] = "0" * 64
        path.write_text(json.dumps(manifest), encoding="utf-8")

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
        description=(
            "Verify frontend generation against the canonical backend handoff in "
            "temporary directories. Checks geometry and polygon identity, supplied "
            "manifest hashes, repeatability and atomic failure recovery without "
            "changing the supplied metadata or site geometry."
        ),
        epilog=(
            "Supply all four site geometry files and the extracted backend transfer. "
            "Canonical counts are enforced unless --expectations names reviewed "
            "alternate counts (used by the committed CI fixture)."
        ),
    )
    parser.add_argument("--artifact-dir", type=Path, required=True)
    parser.add_argument("--findspot-dir", type=Path, required=True)
    parser.add_argument("--expectations", type=Path)
    args, unittest_args = parser.parse_known_args()
    FindspotMapHandoffTest.artifact_source = args.artifact_dir.resolve()
    FindspotMapHandoffTest.geometry_source = args.findspot_dir.resolve()
    FindspotMapHandoffTest.expectations = (
        args.expectations.resolve() if args.expectations is not None else None
    )
    unittest.main(argv=[sys.argv[0], *unittest_args])
