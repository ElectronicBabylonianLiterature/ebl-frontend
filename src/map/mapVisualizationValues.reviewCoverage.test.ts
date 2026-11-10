import type { FragmentMapDataState } from 'map/useFragmentMapData'
import {
  buildVisualizationValues,
  visualizationValuesFor,
} from 'map/mapVisualizationValues'
import { aggregateFindspotMapData } from 'fragmentarium/domain/findspotMapDataSanitizer'
import {
  excavationPolygon,
  findspotMapDataDto,
} from 'test-support/map-fixtures'

it('keeps unknown site geometry unavailable even when another site has loaded', () => {
  const row = findspotMapDataDto()
  const summaries = aggregateFindspotMapData([row])
  const mapData: FragmentMapDataState = {
    sites: new Map([
      [
        'assur',
        {
          status: 'loaded-with-mappings',
          findspots: [row],
          polygonSummaries: summaries,
        },
      ],
    ]),
    findspots: [row],
    polygonSummaries: summaries,
  }
  const polygon = excavationPolygon({
    polygonId: 'unknown-area',
    siteId: 'unknown',
  })
  const values = buildVisualizationValues(
    mapData,
    new Map([['unknown', [polygon]]]),
  )

  expect(values.get('unknown-area')).toMatchObject({
    dataAvailable: false,
    accessibleFragmentCount: 0,
  })
  expect(visualizationValuesFor(values, 'count')).toEqual([])
})

it('does not turn a missing numeric density payload into a zero classification', () => {
  const row = findspotMapDataDto()
  const summaries = aggregateFindspotMapData([row])
  const mapData: FragmentMapDataState = {
    sites: new Map([
      [
        'assur',
        {
          status: 'loaded-with-mappings',
          findspots: [row],
          polygonSummaries: summaries,
        },
      ],
    ]),
    findspots: [row],
    polygonSummaries: summaries,
  }
  const values = buildVisualizationValues(
    mapData,
    new Map([['assur', [excavationPolygon()]]]),
  )
  const value = values.get(row.polygonIds[0])
  expect(value).toBeDefined()
  if (!value) throw new Error('Expected canonical polygon value')
  const partial = new Map([
    [value.polygonId, { ...value, densityPerSquareKm: null }],
  ])

  expect(visualizationValuesFor(partial, 'density')).toEqual([])
  expect(visualizationValuesFor(partial, 'count')).toEqual([2])
})
