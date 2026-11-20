import React, { useRef } from 'react'
import { act, fireEvent, screen, within } from '@testing-library/react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import { initializeFindspotMap } from 'map/maplibre/mapFindspotLifecycle'
import useFindspotMap from 'map/maplibre/useFindspotMap'
import { renderHarness } from 'map/maplibre/useFindspotMap.testSupport'
import {
  makeProvenance,
  mockCanvas,
  mockCaptureException,
  mockOn,
  mockQueryRenderedFeatures,
  mockSetDOMContent,
  resetMapMocks,
  triggerMapEvent,
} from 'map/ui/MapTab.testSupport'
import LocationDisplay from 'test-support/LocationDisplay'

jest.mock('maplibre-gl')

beforeEach(resetMapMocks)

function DefaultHarness(): JSX.Element {
  const ref = useRef<HTMLDivElement>(null)
  useFindspotMap(ref, [makeProvenance()])
  return (
    <>
      <div ref={ref} />
      <LocationDisplay testId="route" />
    </>
  )
}

it('provides default camera ownership and preserves popup navigation without callbacks', () => {
  renderHarness(<DefaultHarness />)
  mockQueryRenderedFeatures.mockImplementation((_point, options) =>
    (options as { layers: string[] }).layers.includes('ebl-unclustered-points')
      ? [
          {
            type: 'Feature',
            properties: {
              id: 'Babylon',
              name: 'Babylon',
              abbreviation: 'B',
              geometryType: 'point',
            },
            geometry: { type: 'Point', coordinates: [44, 33] },
          },
        ]
      : [],
  )
  act(() => triggerMapEvent('click', { point: { x: 0, y: 0 } }))
  const popup = mockSetDOMContent.mock.calls[0][0] as HTMLDivElement
  fireEvent.click(within(popup).getByRole('link', { name: 'View tablets' }))
  expect(screen.getByTestId('route')).toHaveTextContent(
    '/library/search?site=Babylon',
  )
})

it.each([
  { geometry: { type: 'Polygon', coordinates: [] }, properties: {} },
  {
    geometry: { type: 'Point', coordinates: [44, 33] },
    properties: { name: 4 },
  },
])(
  'ignores malformed rendered marker payloads before opening a popup: %j',
  (feature) => {
    renderHarness(<DefaultHarness />)
    mockQueryRenderedFeatures.mockImplementation((_point, options) =>
      (options as { layers: string[] }).layers.includes(
        'ebl-unclustered-points',
      )
        ? [feature]
        : [],
    )
    act(() => triggerMapEvent('click', { point: { x: 0, y: 0 } }))
    expect(mockSetDOMContent).not.toHaveBeenCalled()
  },
)

it('ignores captured style, error, and pointer callbacks after map ownership changes', () => {
  const mapRef: { current: MapLibreMap | null } = { current: null }
  const dispose = initializeFindspotMap(document.createElement('div'), mapRef, {
    getState: () => ({
      provenances: [],
      isInteractionEnabled: true,
      interactionVersion: 0,
    }),
    camera: {
      capture: () => () => true,
      claim: () => () => true,
      shouldFitData: () => true,
    },
    navigate: jest.fn(),
    reportError: mockCaptureException,
  })
  act(() => triggerMapEvent('mouseenter', undefined, 'ebl-clusters'))
  expect(mockCanvas).toHaveStyle({ cursor: 'pointer' })
  act(() => triggerMapEvent('mouseleave', undefined, 'ebl-clusters'))
  expect(mockCanvas).toHaveStyle({ cursor: '' })
  act(() => triggerMapEvent('mousemove', { point: { x: 0, y: 0 } }))
  expect(mockQueryRenderedFeatures).toHaveBeenCalled()
  const subscriptions = [...mockOn.mock.calls]
  mapRef.current = null
  mockCanvas.style.cursor = 'crosshair'
  mockQueryRenderedFeatures.mockClear()
  subscriptions.forEach(([event, layerOrCallback, callback]) => {
    const handler = callback ?? layerOrCallback
    if (event === 'error')
      handler({ error: { message: 'late worker failure' } })
    else if (event === 'mousemove') handler({ point: { x: 0, y: 0 } })
    else if (event === 'mouseleave' || event === 'style.load') handler()
  })
  expect(mockCanvas).toHaveStyle({ cursor: 'crosshair' })
  expect(mockCaptureException).not.toHaveBeenCalled()
  expect(mockQueryRenderedFeatures).not.toHaveBeenCalled()
  dispose?.()
  expect(mapRef.current).toBeNull()
})
