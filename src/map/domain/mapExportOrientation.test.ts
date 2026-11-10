import type { Geometry, Position } from 'geojson'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import orientExportGeometry from 'map/domain/mapExportOrientation'
import { buildExportGeoJson, toExportRows } from 'map/domain/mapExportData'
import { excavationPolygon } from 'test-support/map-fixtures'

const CLOCKWISE = [
  [0, 0],
  [0, 4],
  [4, 4],
  [4, 0],
  [0, 0],
]
const COUNTERCLOCKWISE = [...CLOCKWISE].reverse()
const area = (ring: Position[]): number =>
  ring.reduce((sum, position, index) => {
    const next = ring[(index + 1) % ring.length]
    return sum + position[0] * next[1] - next[0] * position[1]
  }, 0)

describe('export polygon orientation', () => {
  it.each(['Polygon', 'MultiPolygon'] as const)(
    'orients %s exteriors counterclockwise and holes clockwise without mutation',
    (type) => {
      const rings = [CLOCKWISE, COUNTERCLOCKWISE]
      const geometry: Geometry =
        type === 'Polygon'
          ? { type, coordinates: rings }
          : { type, coordinates: [rings, rings] }
      const original = JSON.stringify(geometry)
      const result = orientExportGeometry(geometry)
      const polygons =
        result.type === 'Polygon'
          ? [result.coordinates]
          : result.type === 'MultiPolygon'
            ? result.coordinates
            : []
      expect(polygons).toHaveLength(type === 'Polygon' ? 1 : 2)
      polygons.forEach(([exterior, hole]) => {
        expect(area(exterior)).toBeGreaterThan(0)
        expect(area(hole)).toBeLessThan(0)
      })
      expect(JSON.stringify(geometry)).toBe(original)
      expect(orientExportGeometry(result)).toEqual(result)
    },
  )

  it('preserves already conforming rings and nonpolygon geometries', () => {
    const polygon: Geometry = {
      type: 'Polygon',
      coordinates: [COUNTERCLOCKWISE, CLOCKWISE],
    }
    expect(orientExportGeometry(polygon)).toEqual(polygon)
    expect(
      orientExportGeometry({ type: 'Point', coordinates: [43, 35] }),
    ).toEqual({
      type: 'Point',
      coordinates: [43, 35],
    })
  })

  it('normalizes only exported geometry while canonical ids and asset hashes remain stable', () => {
    const asset = path.resolve(
      __dirname,
      '../../../public/map-data/findspots/all.geojson',
    )
    const bytes = fs.readFileSync(asset)
    const hash = (value: Buffer): string =>
      crypto.createHash('sha256').update(value).digest('hex')
    const source = JSON.parse(bytes.toString())
    const original = JSON.stringify(source)
    const polygons = source.features.map(
      (feature: { id: string; geometry: Geometry }) =>
        excavationPolygon({
          polygonId: feature.id,
          geometry: feature.geometry,
        }),
    )
    const rows = toExportRows(polygons, new Map())
    const result = buildExportGeoJson(rows, {
      visualization: 'evidence',
      siteFilter: '',
      shareUrl: '',
      exportedAt: '2026-11-06T00:00:00Z',
      scope: { type: 'viewport', bounds: [] },
      dataStatuses: {},
    })
    expect(result.features.map((feature) => feature.id)).toEqual(
      rows.map((row) => row.polygonId),
    )
    result.features.forEach(({ geometry }) => {
      const rings =
        geometry.type === 'Polygon'
          ? [geometry.coordinates]
          : geometry.type === 'MultiPolygon'
            ? geometry.coordinates
            : []
      rings.forEach(([exterior]) => expect(area(exterior)).toBeGreaterThan(0))
    })
    expect(JSON.stringify(source)).toBe(original)
    expect(hash(fs.readFileSync(asset))).toBe(hash(bytes))
  })
})
