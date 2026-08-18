import fs from 'fs'
import path from 'path'
import type { FeatureCollection, Geometry } from 'geojson'

const root = path.resolve(__dirname, '../..')
const expectedCounts = { assur: 134, kalhu: 12, nippur: 20, uruk: 128 }

function readGeoJson(siteId: keyof typeof expectedCounts): FeatureCollection {
  return JSON.parse(
    fs.readFileSync(
      path.join(root, 'public', 'map-data', 'findspots', `${siteId}.geojson`),
      'utf8',
    ),
  ) as FeatureCollection
}

function visitCoordinates(
  geometry: Geometry,
  check: (point: number[]) => void,
): void {
  if (geometry.type === 'Polygon') {
    geometry.coordinates.flat(1).forEach(check)
  } else if (geometry.type === 'MultiPolygon') {
    geometry.coordinates.flat(2).forEach(check)
  }
}

describe('normalized findspot GeoJSON', () => {
  it('contains the expected per-site feature counts', () => {
    let total = 0
    for (const [siteId, count] of Object.entries(expectedCounts)) {
      const geojson = readGeoJson(siteId as keyof typeof expectedCounts)
      expect(geojson.type).toBe('FeatureCollection')
      expect(geojson.features).toHaveLength(count)
      total += geojson.features.length
    }
    expect(total).toBe(294)
  })

  it('has stable IDs, properties, polygonal geometries, and EPSG:4326 coordinates', () => {
    for (const siteId of Object.keys(
      expectedCounts,
    ) as (keyof typeof expectedCounts)[]) {
      for (const feature of readGeoJson(siteId).features) {
        expect(feature.id).toBeTruthy()
        expect(feature.properties?.id).toBe(feature.id)
        expect(feature.properties?.siteId).toBe(siteId)
        expect(feature.properties?.locationType).toBe('excavation_area')
        expect(feature.properties?.name).toEqual(expect.any(String))
        expect(['Polygon', 'MultiPolygon']).toContain(feature.geometry.type)
        visitCoordinates(feature.geometry, ([longitude, latitude]) => {
          expect(Number.isFinite(longitude)).toBe(true)
          expect(Number.isFinite(latitude)).toBe(true)
          expect(longitude).toBeGreaterThanOrEqual(-180)
          expect(longitude).toBeLessThanOrEqual(180)
          expect(latitude).toBeGreaterThanOrEqual(-90)
          expect(latitude).toBeLessThanOrEqual(90)
        })
      }
    }
  })

  it('fills Uruk IDs deterministically and preserves supplied source IDs elsewhere', () => {
    for (const feature of readGeoJson('uruk').features) {
      expect(feature.id).toMatch(/^uruk-/)
      expect(feature.properties?.sourceId).toBeUndefined()
    }
    for (const siteId of ['assur', 'kalhu', 'nippur'] as const) {
      expect(
        readGeoJson(siteId).features.every(
          (feature) => feature.properties?.sourceId !== undefined,
        ),
      ).toBe(true)
    }
  })
})
