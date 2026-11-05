import React, { useRef } from 'react'
import { render } from '@testing-library/react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import useExcavationAreas from 'map/useExcavationAreas'
import {
  buildExcavationPolygonIndex,
  type ExcavationPolygonIndex,
} from 'map/excavationPolygonIndex'
import { polygonFeature } from 'test-support/map-fixtures'
import {
  markLayersAdded,
  mockAddLayer,
  mockAddSource,
  mockMapInstance,
  mockSetLayoutProperty,
  resetMapMocks,
} from 'map/mapLibreMock.testSupport'

jest.mock('maplibre-gl')

const INDEX = buildExcavationPolygonIndex({
  type: 'FeatureCollection',
  features: [polygonFeature('assur-area', 'assur')],
})

function Harness({
  index,
}: {
  readonly index: ExcavationPolygonIndex | null
}): null {
  const mapRef = useRef(mockMapInstance as unknown as MapLibreMap)
  useExcavationAreas(mapRef, true, undefined, index)
  return null
}

beforeEach(resetMapMocks)

it('waits for validation before rendering the same canonical geometry without another URL download', () => {
  const { rerender } = render(<Harness index={null} />)
  expect(mockAddSource).not.toHaveBeenCalled()
  rerender(<Harness index={INDEX} />)
  expect(mockAddSource).toHaveBeenCalledWith('excavation-areas', {
    type: 'geojson',
    promoteId: 'id',
    data: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          id: 'assur-area',
          properties: { id: 'assur-area', siteId: 'assur', name: 'Area A' },
          geometry: INDEX.get('assur')?.[0].geometry,
        },
      ],
    },
  })
  expect(mockSetLayoutProperty).toHaveBeenCalledWith(
    'excavation-area-fill',
    'visibility',
    'visible',
  )
})

it('inserts fills and outlines below findspot clusters, labels and points in actual render order', () => {
  const layerIds = [
    'ebl-clusters',
    'ebl-cluster-count',
    'ebl-unclustered-points',
  ]
  markLayersAdded(...layerIds)
  render(<Harness index={INDEX} />)
  mockAddLayer.mock.calls.forEach(([layer, beforeId]) => {
    const beforeIndex =
      beforeId === undefined ? layerIds.length : layerIds.indexOf(beforeId)
    expect(beforeIndex).toBeGreaterThanOrEqual(0)
    layerIds.splice(beforeIndex, 0, layer.id)
  })
  expect(layerIds).toEqual([
    'excavation-area-fill',
    'excavation-area-outline',
    'ebl-clusters',
    'ebl-cluster-count',
    'ebl-unclustered-points',
  ])
})
