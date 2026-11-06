import { renderHook } from '@testing-library/react'
import type { FragmentMapDataState } from 'map/useFragmentMapData'
import useMapVisualization from 'map/useMapVisualization'
import { aggregateFindspotMapData } from 'map/findspotMapDataSanitizer'
import {
  excavationPolygon,
  findspotMapDataDto,
} from 'test-support/map-fixtures'

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

it('classifies positive density using the accessible count and mapped area', () => {
  const index = new Map([['assur', [excavationPolygon({ areaSquareKm: 0.5 })]]])
  const { result } = renderHook(() =>
    useMapVisualization(mapData, index, 'density'),
  )

  expect(result.current.effectiveMode).toBe('density')
  expect(result.current.isDensityAvailable).toBe(true)
  expect(result.current.scale).toMatchObject({ valueKey: 'densityPerSquareKm' })
  expect(result.current.paint).toMatchObject({
    kind: 'choropleth',
    scale: result.current.scale,
  })
  expect(result.current.values.get(row.polygonIds[0])?.densityPerSquareKm).toBe(
    4,
  )
  expect(result.current.legend.classifiedFeatureCount).toBe(1)
})

it('falls back to mapped status when no valid area denominator exists', () => {
  const index = new Map([
    ['assur', [excavationPolygon({ areaSquareKm: null })]],
  ])
  const { result } = renderHook(() =>
    useMapVisualization(mapData, index, 'density'),
  )

  expect(result.current.effectiveMode).toBe('mapped')
  expect(result.current.isDensityAvailable).toBe(false)
  expect(result.current.paint.kind).toBe('categorical')
  expect(result.current.legend.mode).toBe('mapped')
  expect(
    result.current.values.get(row.polygonIds[0])?.accessibleFragmentCount,
  ).toBe(2)
  expect(
    result.current.values.get(row.polygonIds[0])?.densityPerSquareKm,
  ).toBeNull()
})

it('uses numeric count paint and switches to categorical evidence without changing scoped counts', () => {
  const index = new Map([['assur', [excavationPolygon()]]])
  const { result, rerender } = renderHook(
    ({ mode }: { mode: 'count' | 'evidence' }) =>
      useMapVisualization(mapData, index, mode),
    { initialProps: { mode: 'count' } },
  )

  expect(result.current.paint).toMatchObject({
    kind: 'choropleth',
    scale: { valueKey: 'accessibleFragmentCount' },
  })
  expect(result.current.legend.classifiedFeatureCount).toBe(1)
  rerender({ mode: 'evidence' })
  expect(result.current.paint.kind).toBe('evidence')
  expect(result.current.scale).toBeNull()
  expect(
    result.current.values.get(row.polygonIds[0])?.accessibleFragmentCount,
  ).toBe(2)
})
