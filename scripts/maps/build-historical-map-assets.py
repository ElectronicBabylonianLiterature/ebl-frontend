#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
import math
import os
import re
import shutil
import subprocess
import sys
import zipfile
from collections import deque
from dataclasses import dataclass
from pathlib import Path
from typing import Any
from xml.etree import ElementTree

import numpy
from osgeo import gdal, ogr, osr


ROOT = Path(__file__).resolve().parents[2]
MAPS_DIR = ROOT / 'Maps'
PROCESSING_DIR = ROOT / '.map-processing'
HISTORICAL_PROCESSING_DIR = PROCESSING_DIR / 'historical-maps'
PUBLIC_HISTORICAL_DIR = ROOT / 'public' / 'historical-maps'
PUBLIC_MAP_DATA_DIR = ROOT / 'public' / 'map-data'
GENERATED_OVERLAYS_TS = ROOT / 'src' / 'map' / 'historicalOverlays.generated.ts'
INVENTORY_JSON = PROCESSING_DIR / 'map-inventory.json'
REPORT_JSON = PROCESSING_DIR / 'map-processing-report.json'
BACKEND_MAP_DIR = Path('/workspaces/ebl-api/ebl/fragmentarium/data/map')
ASSUR_POLYGON_INVENTORY_JSON = Path(
    os.environ.get(
        'ASSUR_POLYGON_INVENTORY_JSON',
        BACKEND_MAP_DIR / 'assur_polygon_inventory.json',
    )
)
ASSUR_FINDSPOT_POLYGON_MAPPINGS_JSON = Path(
    os.environ.get(
        'ASSUR_FINDSPOT_POLYGON_MAPPINGS_JSON',
        BACKEND_MAP_DIR / 'assur_findspot_polygon_mappings.json',
    )
)
WEB_MERCATOR_RESOLUTION_Z0 = 156543.03392804097

SITES = {
    'assur': {
        'name': 'Aššur',
        'ascii': 'assur',
        'source_marker': 'Assur LRZ',
        'center': (43.262, 35.459),
        'findspots': MAPS_DIR / 'Assur LRZ' / 'Findspots' / 'Findspots.shp',
        'ods': [MAPS_DIR / 'Assur LRZ' / 'Assur Tafeln.ods'],
    },
    'kalhu': {
        'name': 'Kalḫu',
        'ascii': 'kalhu',
        'source_marker': 'Kalhu LRZ',
        'center': (43.329, 36.096),
        'findspots': MAPS_DIR / 'Kalhu LRZ' / 'Findspots' / 'Findspots.shp',
        'ods': [MAPS_DIR / 'Kalhu LRZ' / 'Kalhu Tafeln.ods'],
    },
    'nippur': {
        'name': 'Nippur',
        'ascii': 'nippur',
        'source_marker': 'Nippur LRZ',
        'center': (45.234, 32.126),
        'findspots': MAPS_DIR / 'Nippur LRZ' / 'Findspots' / 'Findspots.shp',
        'ods': [MAPS_DIR / 'Nippur LRZ' / 'Nippur Tafeln.ods'],
    },
    'uruk': {
        'name': 'Uruk',
        'ascii': 'uruk',
        'source_marker': 'Uruk LRZ',
        'center': (45.636, 31.324),
        'findspots': MAPS_DIR / 'Uruk LRZ' / 'Findspots' / 'Findspots.shp',
        'ods': [
            MAPS_DIR / 'Uruk LRZ' / 'Uruk Tafeln.ods',
            MAPS_DIR / 'Uruk Tafeln aktualisiert 24-07-25.ods',
        ],
    },
}

PUBLICATION_WORDS = {
    'abb': 'Abb.',
    'assyrian': 'Assyrian',
    'assur': 'Aššur',
    'beilage': 'Beilage',
    'die': 'Die',
    'eichmann': 'Eichmann',
    'excavations': 'Excavations',
    'fig': 'Fig.',
    'gibson': 'Gibson',
    'hausleiter': 'Hausleiter',
    'heinrich': 'Heinrich',
    'mcmahon': 'McMahon',
    'nimrud': 'Nimrud',
    'nippur': 'Nippur',
    'oic': 'OIC',
    'palaste': 'Paläste',
    'preusser': 'Preusser',
    'rn': 'RN',
    'russell': 'Russell',
    'taf': 'Taf.',
    'tf': 'Tf.',
    'uruk': 'Uruk',
    'wohnhauser': 'Wohnhäuser',
}


@dataclass(frozen=True)
class CanonicalTiff:
    path: Path
    checksum: str
    duplicates: tuple[Path, ...]
    site_id: str


def run(command: list[str], *, cwd: Path = ROOT) -> subprocess.CompletedProcess[str]:
    result = subprocess.run(command, cwd=cwd, text=True, capture_output=True)
    if result.returncode != 0:
        raise RuntimeError(
            f'Command failed: {command}\nSTDOUT:\n{result.stdout}\nSTDERR:\n{result.stderr}'
        )
    return result


def require_tools() -> None:
    for tool in ['gdalinfo', 'gdal_translate', 'gdal2tiles.py', 'ogr2ogr']:
        if shutil.which(tool) is None:
            raise SystemExit(f'Required GDAL tool not found: {tool}')


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open('rb') as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b''):
            digest.update(chunk)
    return digest.hexdigest()


def relative(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def slugify(value: str) -> str:
    transliterated = (
        value.lower()
        .replace('š', 's')
        .replace('ḫ', 'h')
        .replace('ä', 'a')
        .replace('ö', 'o')
        .replace('ü', 'u')
        .replace('ß', 'ss')
    )
    transliterated = re.sub(r'[^a-z0-9]+', '-', transliterated)
    return re.sub(r'-+', '-', transliterated).strip('-')


def source_name_key(value: str) -> str:
    return slugify(value.strip())


def read_json(path: Path) -> Any:
    return json.loads(path.read_text())


def records_from_json(value: Any, keys: tuple[str, ...]) -> list[dict[str, Any]]:
    if isinstance(value, list):
        records = value
    elif isinstance(value, dict):
        records = next((value[key] for key in keys if isinstance(value.get(key), list)), None)
    else:
        records = None
    if not isinstance(records, list) or not all(isinstance(record, dict) for record in records):
        raise RuntimeError(f'Unsupported JSON record schema. Expected list or one of keys: {keys}')
    return records


def first_string(record: dict[str, Any], fields: tuple[str, ...]) -> str | None:
    for field in fields:
        value = record.get(field)
        if isinstance(value, str) and value.strip():
            return value.strip()
    return None


def polygon_ids_from_mapping(record: dict[str, Any]) -> list[str]:
    value = record.get('polygonIds')
    if isinstance(value, list):
        return [item.strip() for item in value if isinstance(item, str) and item.strip()]
    value = record.get('polygonId')
    if isinstance(value, str) and value.strip():
        return [value.strip()]
    return []


def load_assur_canonical_inventory() -> dict[str, str] | None:
    if not ASSUR_POLYGON_INVENTORY_JSON.exists():
        return None

    records = records_from_json(
        read_json(ASSUR_POLYGON_INVENTORY_JSON),
        ('polygons', 'inventory', 'features'),
    )
    by_source_name: dict[str, str] = {}
    for index, record in enumerate(records, start=1):
        canonical_id = first_string(record, ('id', 'polygonId', 'canonicalId', 'inventoryId'))
        source_name = first_string(
            record,
            (
                'sourceName',
                'source_name',
                'sourcePolygonName',
                'source_polygon_name',
                'name',
                'normalizedSourceName',
                'normalized_source_name',
                'normalizedName',
                'normalized_name',
            ),
        )
        if canonical_id is None or source_name is None:
            raise RuntimeError(f'Missing canonical id or source name in inventory row {index}')
        if not canonical_id.startswith('assur-'):
            raise RuntimeError(f'Unexpected non-Aššur canonical id in inventory: {canonical_id}')
        key = source_name_key(source_name)
        if key in by_source_name:
            raise RuntimeError(f'Ambiguous Aššur inventory source-name match: {source_name}')
        by_source_name[key] = canonical_id

    if len(by_source_name) != len(records):
        raise RuntimeError('Aššur inventory contains duplicate source-name keys')
    return by_source_name


def validate_assur_mapping_coverage(generated_ids: set[str]) -> dict[str, Any]:
    if not ASSUR_FINDSPOT_POLYGON_MAPPINGS_JSON.exists():
        return {
            'source': None,
            'recordCount': None,
            'distinctPolygonIdCount': None,
            'missingPolygonIds': [],
            'status': 'mapping artifact unavailable',
        }

    records = records_from_json(
        read_json(ASSUR_FINDSPOT_POLYGON_MAPPINGS_JSON),
        ('mappings', 'findspots', 'records'),
    )
    mapped_ids = sorted({polygon_id for record in records for polygon_id in polygon_ids_from_mapping(record)})
    missing = [polygon_id for polygon_id in mapped_ids if polygon_id not in generated_ids]
    if missing:
        raise RuntimeError(f'Aššur mapping polygon IDs missing from generated GeoJSON: {missing}')
    return {
        'source': relative(ASSUR_FINDSPOT_POLYGON_MAPPINGS_JSON) if ASSUR_FINDSPOT_POLYGON_MAPPINGS_JSON.is_relative_to(ROOT) else str(ASSUR_FINDSPOT_POLYGON_MAPPINGS_JSON),
        'recordCount': len(records),
        'distinctPolygonIdCount': len(mapped_ids),
        'missingPolygonIds': missing,
        'status': 'validated',
    }


def split_identifier(stem: str) -> tuple[str, str]:
    if '@' in stem:
        publication, plate = stem.split('@', 1)
    else:
        publication, plate = stem, ''
    return publication, plate


def publication_slug(stem: str) -> str:
    publication, plate = split_identifier(stem)
    publication = re.sub(r'([a-z])([0-9])', r'\1-\2', publication)
    publication = re.sub(r'([0-9])([A-Za-z])', r'\1-\2', publication)
    publication_parts = [
        part
        for part in slugify(publication).split('-')
        if part not in {'assyrian', 'assur', 'kalhu', 'nimrud', 'nippur', 'uruk'}
    ]
    plate_slug = slugify(plate)
    plate_parts = [
        part
        for part in plate_slug.split('-')
        if part not in {'abb', 'beilage', 'taf', 'tf'} or len(plate_slug.split('-')) == 1
    ]
    return '-'.join([*publication_parts, *plate_parts])


def overlay_id(site_id: str, path: Path) -> str:
    return f'{site_id}-{publication_slug(path.stem)}'


def titleize_identifier(stem: str, site_name: str) -> tuple[str, str, str | None]:
    publication, plate = split_identifier(stem)
    tokens = re.findall(r'[A-Za-zÄÖÜäöüŠšḪḫ]+|[0-9]+', publication)
    title_tokens = [PUBLICATION_WORDS.get(slugify(token), token) for token in tokens]
    plate_label = None
    if plate:
        plate_tokens = re.findall(r'[A-Za-z]+|[0-9]+[A-Za-z]?', plate)
        plate_label = ' '.join(PUBLICATION_WORDS.get(slugify(token), token) for token in plate_tokens)
    short_title = ' '.join(title_tokens).strip() or stem
    title = f'{short_title}, {site_name}'
    if plate_label:
        title = f'{title}, {plate_label}'
    date = next((token for token in tokens if re.fullmatch(r'[12][0-9]{3}', token)), None)
    return title, short_title, date


def site_for_path(path: Path) -> str:
    text = path.as_posix()
    for site_id, site in SITES.items():
        if site['source_marker'] in text:
            return site_id
    if 'Maps/Georeferenzierte Karten/' in text:
        return 'nippur'
    raise ValueError(f'Cannot determine site for {path}')


def canonical_for_group(paths: list[Path]) -> Path:
    def score(path: Path) -> tuple[int, str]:
        site_id = site_for_path(path)
        marker = str(SITES[site_id]['source_marker'])
        preferred = 0 if marker in path.as_posix() else 1
        return preferred, path.as_posix()

    return sorted(paths, key=score)[0]


def discover_tiffs() -> list[CanonicalTiff]:
    groups: dict[str, list[Path]] = {}
    for path in sorted(MAPS_DIR.rglob('*')):
        if path.suffix.lower() in {'.tif', '.tiff'}:
            groups.setdefault(sha256(path), []).append(path)

    canonical: list[CanonicalTiff] = []
    for checksum, paths in groups.items():
        chosen = canonical_for_group(paths)
        canonical.append(
            CanonicalTiff(
                path=chosen,
                checksum=checksum,
                duplicates=tuple(path for path in paths if path != chosen),
                site_id=site_for_path(chosen),
            )
        )
    return sorted(canonical, key=lambda item: (item.site_id, item.path.as_posix()))


def gdal_info(path: Path) -> dict[str, Any]:
    return json.loads(run(['gdalinfo', '-json', str(path)]).stdout)


def bounds4326(info: dict[str, Any]) -> list[float]:
    ring = info['wgs84Extent']['coordinates'][0]
    xs = [point[0] for point in ring]
    ys = [point[1] for point in ring]
    return [round(min(xs), 7), round(min(ys), 7), round(max(xs), 7), round(max(ys), 7)]


def bounds3857(info: dict[str, Any]) -> list[float] | None:
    corner = info.get('cornerCoordinates')
    if not corner:
        return None
    xs = [corner[name][0] for name in ['upperLeft', 'lowerLeft', 'lowerRight', 'upperRight']]
    ys = [corner[name][1] for name in ['upperLeft', 'lowerLeft', 'lowerRight', 'upperRight']]
    return [round(min(xs), 3), round(min(ys), 3), round(max(xs), 3), round(max(ys), 3)]


def is_plausible(site_id: str, bounds: list[float]) -> bool:
    center = SITES[site_id]['center']
    return bounds[0] - 0.25 <= center[0] <= bounds[2] + 0.25 and bounds[1] - 0.25 <= center[1] <= bounds[3] + 0.25


def native_resolution_m(info: dict[str, Any], bounds: list[float]) -> float:
    width, height = info['size']
    lon_width = max(bounds[2] - bounds[0], 0.0000001)
    lat_mid = (bounds[1] + bounds[3]) / 2
    metres_per_degree_lon = 111320 * math.cos(math.radians(lat_mid))
    metres_per_degree_lat = 110540
    x_resolution = lon_width * metres_per_degree_lon / width
    y_resolution = max(bounds[3] - bounds[1], 0.0000001) * metres_per_degree_lat / height
    return max(abs(x_resolution), abs(y_resolution), 0.001)


def zoom_range(info: dict[str, Any], bounds: list[float]) -> tuple[int, int, str]:
    resolution = native_resolution_m(info, bounds)
    native_zoom = math.log2(WEB_MERCATOR_RESOLUTION_Z0 / resolution)
    max_zoom = min(19, max(12, math.ceil(native_zoom)))
    width_m = max((bounds[2] - bounds[0]) * 111320 * math.cos(math.radians((bounds[1] + bounds[3]) / 2)), 1)
    if width_m > 2500:
        min_zoom = max(10, max_zoom - 6)
    elif width_m > 700:
        min_zoom = max(12, max_zoom - 5)
    else:
        min_zoom = max(14, max_zoom - 4)
    min_zoom = min(min_zoom, max_zoom)
    rationale = f'native resolution {resolution:.2f} m/px gives z{native_zoom:.1f}; extent width {width_m:.0f} m'
    return min_zoom, max_zoom, rationale


def has_alpha(info: dict[str, Any]) -> bool:
    return any(band.get('colorInterpretation') == 'Alpha' for band in info.get('bands', []))


def write_masked_rgba(source: Path, destination: Path) -> str:
    dataset = gdal.Open(str(source))
    if dataset is None or dataset.RasterCount < 3:
        raise RuntimeError(f'Cannot read RGB bands from {source}')
    arrays = [dataset.GetRasterBand(index).ReadAsArray() for index in [1, 2, 3]]
    rgb = numpy.dstack(arrays).astype(numpy.int16)
    height, width, _ = rgb.shape
    border = numpy.concatenate([rgb[0, :, :], rgb[-1, :, :], rgb[:, 0, :], rgb[:, -1, :]], axis=0)
    border_color = numpy.median(border, axis=0)
    distance = numpy.abs(rgb - border_color).max(axis=2)
    background_like = distance <= 18
    exterior = numpy.zeros((height, width), dtype=bool)
    queue: deque[tuple[int, int]] = deque()
    for x in range(width):
        queue.append((0, x))
        queue.append((height - 1, x))
    for y in range(height):
        queue.append((y, 0))
        queue.append((y, width - 1))
    while queue:
        y, x = queue.popleft()
        if y < 0 or x < 0 or y >= height or x >= width or exterior[y, x] or not background_like[y, x]:
            continue
        exterior[y, x] = True
        queue.extend([(y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)])
    alpha = numpy.where(exterior, 0, 255).astype(numpy.uint8)
    driver = gdal.GetDriverByName('GTiff')
    temp = destination.with_suffix('.rgba.tif')
    output = driver.Create(str(temp), width, height, 4, gdal.GDT_Byte, options=['COMPRESS=DEFLATE', 'TILED=YES'])
    output.SetGeoTransform(dataset.GetGeoTransform())
    output.SetProjection(dataset.GetProjection())
    for index, array in enumerate(arrays, start=1):
        output.GetRasterBand(index).WriteArray(array)
    output.GetRasterBand(4).WriteArray(alpha)
    output.GetRasterBand(4).SetColorInterpretation(gdal.GCI_AlphaBand)
    output.FlushCache()
    output = None
    dataset = None
    return str(temp)


def make_cog(source: Path, info: dict[str, Any], overlay_dir: Path, overlay: str) -> tuple[Path, str]:
    overlay_dir.mkdir(parents=True, exist_ok=True)
    cog = overlay_dir / f'{overlay}.cog.tif'
    work_source = source
    transparency = 'source alpha preserved'
    temp_rgba: Path | None = None
    if not has_alpha(info):
        temp_rgba = Path(write_masked_rgba(source, cog))
        work_source = temp_rgba
        transparency = 'connected-border alpha mask generated from exterior background'
    run([
        'gdal_translate',
        str(work_source),
        str(cog),
        '-of',
        'COG',
        '-co',
        'COMPRESS=DEFLATE',
        '-co',
        'BIGTIFF=IF_SAFER',
    ])
    if temp_rgba and temp_rgba.exists():
        temp_rgba.unlink()
    cog_info = gdal_info(cog)
    metadata = json.dumps(cog_info.get('metadata', {}))
    if 'LAYOUT' not in metadata or 'COG' not in metadata:
        raise RuntimeError(f'COG validation failed for {cog}')
    return cog, transparency


def safe_replace_tiles(site_id: str, overlay: str, cog: Path, min_zoom: int, max_zoom: int) -> int:
    site_dir = PUBLIC_HISTORICAL_DIR / site_id
    destination = site_dir / overlay
    expected_parent = PUBLIC_HISTORICAL_DIR.resolve()
    site_dir.mkdir(parents=True, exist_ok=True)
    if destination.exists():
        resolved = destination.resolve()
        if expected_parent not in resolved.parents:
            raise RuntimeError(f'Unsafe generated tile destination: {destination}')
        shutil.rmtree(destination)
    run([
        'gdal2tiles.py',
        '--xyz',
        '--webviewer=none',
        '--exclude',
        '--resampling=bilinear',
        '-z',
        f'{min_zoom}-{max_zoom}',
        str(cog),
        str(destination / 'tiles'),
    ])
    return sum(1 for path in (destination / 'tiles').rglob('*.png'))


def directory_size(path: Path) -> int:
    if not path.exists():
        return 0
    return sum(item.stat().st_size for item in path.rglob('*') if item.is_file())


def normalize_findspots() -> dict[str, Any]:
    output_dir = PUBLIC_MAP_DATA_DIR / 'findspots'
    output_dir.mkdir(parents=True, exist_ok=True)
    report: dict[str, Any] = {}
    target_srs = osr.SpatialReference()
    target_srs.ImportFromEPSG(4326)
    all_features: list[dict[str, Any]] = []
    assur_inventory = load_assur_canonical_inventory()
    assur_matched_inventory_keys: set[str] = set()
    for site_id, site in SITES.items():
        source = Path(str(site['findspots']))
        source_ds = ogr.Open(str(source))
        if source_ds is None:
            raise RuntimeError(f'Cannot read shapefile {source}')
        source_layer = source_ds.GetLayer(0)
        source_srs = source_layer.GetSpatialRef()
        transform = osr.CoordinateTransformation(source_srs, target_srs)
        features = []
        for feature in source_layer:
            geom = feature.GetGeometryRef().Clone()
            geom = geom.MakeValid()
            geom.Transform(transform)
            geometry_json = json.loads(geom.ExportToJson())
            name = str(feature.GetField('Name') or '').strip()
            source_id = feature.GetField('id')
            if site_id == 'assur' and assur_inventory is not None:
                inventory_key = source_name_key(name)
                feature_id = assur_inventory.get(inventory_key)
                if feature_id is None:
                    raise RuntimeError(f'Missing Aššur canonical inventory entry for source polygon: {name}')
                if inventory_key in assur_matched_inventory_keys:
                    raise RuntimeError(f'Ambiguous Aššur source polygon name in shapefile: {name}')
                assur_matched_inventory_keys.add(inventory_key)
                source_value = source_id
            elif site_id == 'uruk' or source_id in (None, ''):
                stable_hash = hashlib.sha1(json.dumps(geometry_json, sort_keys=True).encode()).hexdigest()[:10]
                feature_id = f'{site_id}-{slugify(name or "area")}-{stable_hash}'
                source_value = None
            else:
                source_value = source_id
                feature_id = f'{site_id}-{source_id}'
            props = {
                'id': feature_id,
                'siteId': site_id,
                'siteName': site['name'],
                'name': name or feature_id,
                'locationType': 'excavation_area',
            }
            if source_value not in (None, ''):
                props['sourceId'] = source_value
            features.append({'type': 'Feature', 'id': feature_id, 'properties': props, 'geometry': geometry_json})
        collection = {'type': 'FeatureCollection', 'features': features}
        output = output_dir / f'{site_id}.geojson'
        output.write_text(json.dumps(collection, ensure_ascii=False, separators=(',', ':')))
        all_features.extend(features)
        site_report: dict[str, Any] = {
            'source': relative(source),
            'sourceCrs': source_srs.GetAuthorityCode(None) or source_srs.GetName(),
            'output': relative(output),
            'featureCount': len(features),
        }
        if site_id == 'assur':
            if assur_inventory is None:
                site_report['canonicalInventory'] = {
                    'source': str(ASSUR_POLYGON_INVENTORY_JSON),
                    'status': 'unavailable; legacy IDs retained',
                }
            else:
                extra_inventory_keys = sorted(set(assur_inventory) - assur_matched_inventory_keys)
                if extra_inventory_keys:
                    raise RuntimeError(f'Unmatched Aššur canonical inventory entries: {extra_inventory_keys}')
                site_report['canonicalInventory'] = {
                    'source': relative(ASSUR_POLYGON_INVENTORY_JSON) if ASSUR_POLYGON_INVENTORY_JSON.is_relative_to(ROOT) else str(ASSUR_POLYGON_INVENTORY_JSON),
                    'featureCount': len(assur_inventory),
                    'status': 'validated',
                }
                site_report['mappingCoverage'] = validate_assur_mapping_coverage({str(feature['id']) for feature in features})
        report[site_id] = site_report
    all_output = output_dir / 'all.geojson'
    all_output.write_text(
        json.dumps({'type': 'FeatureCollection', 'features': all_features}, ensure_ascii=False, separators=(',', ':'))
    )
    report['all'] = {
        'output': relative(all_output),
        'featureCount': len(all_features),
    }
    return report


def ods_rows(path: Path) -> list[list[str]]:
    if not path.exists():
        return []
    rows: list[list[str]] = []
    with zipfile.ZipFile(path) as archive:
        root = ElementTree.fromstring(archive.read('content.xml'))
    ns = {
        'table': 'urn:oasis:names:tc:opendocument:xmlns:table:1.0',
        'text': 'urn:oasis:names:tc:opendocument:xmlns:text:1.0',
    }
    for row in root.findall('.//table:table-row', ns):
        values: list[str] = []
        for cell in row.findall('table:table-cell', ns):
            repeat = int(cell.attrib.get('{urn:oasis:names:tc:opendocument:xmlns:table:1.0}number-columns-repeated', '1'))
            text = ' '.join(''.join(paragraph.itertext()).strip() for paragraph in cell.findall('text:p', ns)).strip()
            values.extend([text] * min(repeat, 20))
        if any(value for value in values):
            rows.append(values)
    return rows


def normalize_ods(valid_map_ids: set[str]) -> dict[str, Any]:
    output_dir = PUBLIC_MAP_DATA_DIR / 'associations'
    output_dir.mkdir(parents=True, exist_ok=True)
    report: dict[str, Any] = {}
    for site_id, site in SITES.items():
        source_files = [Path(str(path)) for path in site['ods'] if Path(str(path)).exists()]
        preferred = source_files[-1:] if site_id == 'uruk' and len(source_files) > 1 else source_files
        records = []
        unresolved: list[str] = []
        for source_file in preferred:
            for index, row in enumerate(ods_rows(source_file), start=1):
                joined = ' | '.join(row)
                refs = sorted(set(re.findall(r'[A-Za-z0-9ÄÖÜäöüŠšḪḫ]+@[A-Za-z0-9]+', joined)))
                mapped_ids = [f'{site_id}-{publication_slug(ref)}' for ref in refs]
                for mapped_id, ref in zip(mapped_ids, refs):
                    if mapped_id not in valid_map_ids:
                        unresolved.append(ref)
                records.append({
                    'recordId': f'{site_id}-{source_file.stem}-{index}',
                    'siteId': site_id,
                    'area': row[0].strip() if len(row) > 0 and row[0].strip() else None,
                    'sector': row[1].strip() if len(row) > 1 and row[1].strip() else None,
                    'building': row[2].strip() if len(row) > 2 and row[2].strip() else None,
                    'mapId': next((mapped_id for mapped_id in mapped_ids if mapped_id in valid_map_ids), None),
                    'sourceValues': [value.strip() for value in row],
                    'sourceFile': source_file.name,
                })
        output = output_dir / f'{site_id}.json'
        output.write_text(json.dumps(records, ensure_ascii=False, separators=(',', ':')))
        report[site_id] = {
            'sourceFiles': [relative(path) for path in source_files],
            'preferredFiles': [relative(path) for path in preferred],
            'output': relative(output),
            'recordCount': len(records),
            'unresolvedMapReferences': sorted(set(unresolved)),
        }
    return report


def write_overlays_ts(overlays: list[dict[str, Any]]) -> None:
    lines = [
        "import type { HistoricalMapOverlay } from './historicalOverlays'",
        '',
        'export const generatedHistoricalMapOverlays: readonly HistoricalMapOverlay[] = ',
        json.dumps(overlays, ensure_ascii=False, indent=2),
        '',
    ]
    GENERATED_OVERLAYS_TS.write_text('\n'.join(lines))


def write_catalog(overlays: list[dict[str, Any]], findspots: dict[str, Any], ods: dict[str, Any]) -> None:
    catalog = {
        'sites': [
            {
                'siteId': site_id,
                'siteName': site['name'],
                'rasterOverlayIds': [overlay['id'] for overlay in overlays if overlay['siteId'] == site_id],
                'findspotGeoJsonUrl': f'/map-data/findspots/{site_id}.geojson',
                'findspotFeatureCount': findspots[site_id]['featureCount'],
            }
            for site_id, site in SITES.items()
        ],
        'rasterOverlays': [
            {
                'id': overlay['id'],
                'siteId': overlay['siteId'],
                'tiles': overlay['tiles'],
                'bounds': overlay['bounds'],
                'minZoom': overlay['minZoom'],
                'maxZoom': overlay['maxZoom'],
                'sourceChecksum': overlay['sourceChecksum'],
            }
            for overlay in overlays
        ],
        'unresolvedSourceReferences': {
            site_id: data['unresolvedMapReferences'] for site_id, data in ods.items()
        },
    }
    output = PUBLIC_MAP_DATA_DIR / 'catalog.json'
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(catalog, ensure_ascii=False, separators=(',', ':')))


def validate_tile_output(site_id: str, overlay: str, min_zoom: int, max_zoom: int) -> None:
    tile_root = PUBLIC_HISTORICAL_DIR / site_id / overlay / 'tiles'
    if not tile_root.exists():
        raise RuntimeError(f'Missing tile root: {tile_root}')
    for zoom in [min_zoom, max_zoom]:
        if not (tile_root / str(zoom)).exists():
            raise RuntimeError(f'Missing zoom folder {zoom} for {overlay}')
    forbidden = [path for path in tile_root.rglob('*') if path.suffix.lower() in {'.html', '.kml', '.jpg', '.jpeg'}]
    if forbidden:
        raise RuntimeError(f'Forbidden tile outputs for {overlay}: {forbidden}')


def main() -> None:
    require_tools()
    PROCESSING_DIR.mkdir(exist_ok=True)
    canonical = discover_tiffs()
    inventory: list[dict[str, Any]] = []
    overlays: list[dict[str, Any]] = []
    processing: dict[str, Any] = {'rasters': {}, 'duplicates': [], 'excluded': []}

    for item in canonical:
        info = gdal_info(item.path)
        raster_bounds = bounds4326(info)
        bands = info.get('bands', [])
        record: dict[str, Any] = {
            'canonicalSourcePath': relative(item.path),
            'checksum': item.checksum,
            'duplicatePaths': [relative(path) for path in item.duplicates],
            'site': item.site_id,
            'dimensions': info.get('size'),
            'crs': info.get('coordinateSystem', {}).get('wkt', '').split('\n')[0],
            'bounds4326': raster_bounds,
            'bounds3857': bounds3857(info),
            'bandCount': len(bands),
            'hasAlpha': has_alpha(info),
            'fileSize': item.path.stat().st_size,
        }
        inventory.append(record)
        processing['duplicates'].extend(record['duplicatePaths'])
        if not bands or not info.get('coordinateSystem') or not info.get('geoTransform') or not is_plausible(item.site_id, raster_bounds):
            record['processingStatus'] = 'excluded'
            processing['excluded'].append({'source': relative(item.path), 'reason': 'unreadable, ungeoreferenced, or implausible placement'})
            continue

        oid = overlay_id(item.site_id, item.path)
        min_zoom, max_zoom, zoom_rationale = zoom_range(info, raster_bounds)
        title, short_title, date = titleize_identifier(item.path.stem, SITES[item.site_id]['name'])
        series_id = None
        series_title = None
        plate_label = None
        if item.site_id == 'nippur' and item.path.stem.lower().startswith('rn2747@'):
            plate = split_identifier(item.path.stem)[1]
            series_id = 'nippur-rn2747'
            series_title = 'RN 2747'
            plate_label = f"Plate {plate.removeprefix('pl').removeprefix('PL')}"
            title = f'{series_title}, {SITES[item.site_id]["name"]}, {plate_label}'
            short_title = f'{series_title} — {plate_label}'
        cog, transparency = make_cog(item.path, info, HISTORICAL_PROCESSING_DIR / oid, oid)
        tile_count = safe_replace_tiles(item.site_id, oid, cog, min_zoom, max_zoom)
        validate_tile_output(item.site_id, oid, min_zoom, max_zoom)
        tile_dir = PUBLIC_HISTORICAL_DIR / item.site_id / oid / 'tiles'
        overlay = {
            'id': oid,
            'siteId': item.site_id,
            'siteName': SITES[item.site_id]['name'],
            'title': title,
            'shortTitle': short_title,
            'description': 'Georeferenced historical excavation or site plan. Historical source material and georeferencing may include spatial inaccuracies.',
            'sourceFilename': item.path.name,
            'sourceChecksum': item.checksum,
            'attribution': f'{item.path.stem}. Georeferenced dataset supplied to eBL. Publication rights pending confirmation.',
            'type': 'raster-tiles',
            'tiles': [f'/historical-maps/{item.site_id}/{oid}/tiles/{{z}}/{{x}}/{{y}}.png'],
            'bounds': raster_bounds,
            'minZoom': min_zoom,
            'maxZoom': max_zoom,
            'tileSize': 256,
            'defaultOpacity': 0.7,
        }
        if date:
            overlay['dateLabel'] = date
        if series_id and series_title and plate_label:
            overlay['seriesId'] = series_id
            overlay['seriesTitle'] = series_title
            overlay['plateLabel'] = plate_label
        overlays.append(overlay)
        record['processingStatus'] = 'generated'
        record['overlayId'] = oid
        processing['rasters'][oid] = {
            'source': relative(item.path),
            'cog': relative(cog),
            'zoomRange': [min_zoom, max_zoom],
            'zoomRationale': zoom_rationale,
            'tileCount': tile_count,
            'tileSizeBytes': directory_size(tile_dir),
            'transparency': transparency,
        }

    overlays.sort(key=lambda overlay: (overlay['siteId'], overlay.get('dateLabel') or '', overlay['title']))
    write_overlays_ts(overlays)
    findspots = normalize_findspots()
    ods = normalize_ods({overlay['id'] for overlay in overlays})
    write_catalog(overlays, findspots, ods)

    inventory_summary = {
        'tiffPathCount': sum(1 for path in MAPS_DIR.rglob('*') if path.suffix.lower() in {'.tif', '.tiff'}),
        'uniqueTiffCount': len(canonical),
        'shapefileComponents': [relative(path) for path in sorted(MAPS_DIR.rglob('*')) if path.suffix.lower() in {'.shp', '.shx', '.dbf', '.prj', '.cpg'}],
        'odsFiles': [relative(path) for path in sorted(MAPS_DIR.rglob('*.ods'))],
        'rasters': inventory,
    }
    INVENTORY_JSON.write_text(json.dumps(inventory_summary, ensure_ascii=False, indent=2))
    report = {
        **processing,
        'findspots': findspots,
        'ods': ods,
        'overlayCount': len(overlays),
        'totalTileCount': sum(item['tileCount'] for item in processing['rasters'].values()),
        'totalTileSizeBytes': directory_size(PUBLIC_HISTORICAL_DIR),
        'mapDataSizeBytes': directory_size(PUBLIC_MAP_DATA_DIR),
    }
    REPORT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2))
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    gdal.UseExceptions()
    main()
