import React from 'react'
import { act } from '@testing-library/react'
import {
  HookHarness,
  renderHarness,
} from 'map/maplibre/useFindspotMap.testSupport'
import {
  makeProvenance,
  markLayersAdded,
  mockQueryRenderedFeatures,
  resetMapMocks,
  triggerMapEvent,
} from 'map/ui/MapTab.testSupport'

jest.mock('maplibre-gl')

beforeEach(resetMapMocks)

function clickFeature(
  layerId: string,
  properties: Record<string, unknown>,
): void {
  mockQueryRenderedFeatures.mockImplementation((_point, options) => {
    const layers = (options as { layers: string[] }).layers
    return layers.includes(layerId)
      ? [
          {
            type: 'Feature',
            properties: {
              name: 'Babylon',
              abbreviation: 'B',
              geometryType: 'point',
              ...properties,
            },
            geometry: { type: 'Point', coordinates: [44, 33] },
          },
        ]
      : []
  })
  act(() => triggerMapEvent('click', { point: { x: 10, y: 20 } }))
}

it('synchronizes a marker click with the latest inspector callback without rebuilding the map', () => {
  const first = jest.fn()
  const latest = jest.fn()
  const provenances = [makeProvenance()]
  const { rerender } = renderHarness(
    <HookHarness provenances={provenances} onFindspotSelect={first} />,
  )
  rerender(<HookHarness provenances={provenances} onFindspotSelect={latest} />)
  clickFeature('ebl-unclustered-points', {
    id: 'Babylon',
    name: 'Babylon',
    count: 1,
  })
  expect(first).not.toHaveBeenCalled()
  expect(latest).toHaveBeenCalledWith('Babylon')
})

it('selects an excavation polygon without fabricating an exact-findspot route', () => {
  const onExcavationSelect = jest.fn()
  renderHarness(
    <HookHarness
      provenances={[makeProvenance()]}
      onExcavationSelect={onExcavationSelect}
    />,
  )
  markLayersAdded('excavation-area-fill')
  clickFeature('excavation-area-fill', { id: 'uruk-area', siteId: 'uruk' })
  expect(onExcavationSelect).toHaveBeenCalledWith('uruk-area')
})

it('ignores a malformed polygon ID and supports selection without a callback', () => {
  renderHarness(<HookHarness provenances={[makeProvenance()]} />)
  markLayersAdded('excavation-area-fill')
  expect(() =>
    clickFeature('excavation-area-fill', { id: 'uruk-area' }),
  ).not.toThrow()
  expect(() => clickFeature('excavation-area-fill', { id: 4 })).not.toThrow()
  expect(() =>
    clickFeature('ebl-unclustered-points', { name: 'Babylon', count: 1 }),
  ).not.toThrow()
})
