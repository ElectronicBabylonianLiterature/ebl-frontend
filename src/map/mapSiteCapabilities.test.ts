import {
  anySiteHasExcavationPolygons,
  deriveMapSiteCapabilities,
} from 'map/mapSiteCapabilities'
import type { ExcavationPolygonIndex } from 'map/excavationPolygonIndex'
import { excavationPolygon } from 'test-support/map-fixtures'

function indexOf(siteIds: readonly string[]): ExcavationPolygonIndex {
  return new Map(
    siteIds.map((siteId) => [
      siteId,
      [excavationPolygon({ siteId, polygonId: `${siteId}-1` })],
    ]),
  )
}

describe('deriveMapSiteCapabilities', () => {
  it('flags only the sites that have excavation polygons', () => {
    const capabilities = deriveMapSiteCapabilities(indexOf(['assur', 'uruk']))

    expect(
      capabilities
        .filter((capability) => capability.hasExcavationPolygons)
        .map((capability) => capability.siteId),
    ).toEqual(['assur', 'uruk'])
  })

  it('reports every configured site', () => {
    expect(deriveMapSiteCapabilities(new Map())).toHaveLength(4)
  })
})

describe('anySiteHasExcavationPolygons', () => {
  it('is false when no site has polygons', () => {
    expect(
      anySiteHasExcavationPolygons(deriveMapSiteCapabilities(new Map())),
    ).toBe(false)
  })

  it('is true once any site has polygons', () => {
    expect(
      anySiteHasExcavationPolygons(
        deriveMapSiteCapabilities(indexOf(['nippur'])),
      ),
    ).toBe(true)
  })
})
