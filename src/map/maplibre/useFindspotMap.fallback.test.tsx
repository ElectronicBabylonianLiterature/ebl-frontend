import React from 'react'
import { act } from '@testing-library/react'
import {
  deferMapLoad,
  makeProvenance,
  mockAddSource,
  mockGetStyle,
  mockOn,
  mockSetStyle,
  resetMapMocks,
  triggerMapEvent,
} from 'map/ui/MapTab.testSupport'
import {
  HookHarness,
  renderHarness,
} from 'map/maplibre/useFindspotMap.testSupport'

jest.mock('maplibre-gl')

it('keeps markers operational on a plain canvas when the background style fails', () => {
  resetMapMocks()
  deferMapLoad()
  const onMapBackgroundErrorChange = jest.fn()
  renderHarness(
    <HookHarness
      provenances={[makeProvenance()]}
      onMapBackgroundErrorChange={onMapBackgroundErrorChange}
    />,
  )
  act(() =>
    triggerMapEvent('error', {
      error: {
        url: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
        message: 'offline',
      },
    }),
  )
  expect(mockSetStyle).toHaveBeenCalledWith(
    expect.objectContaining({ version: 8, sources: {} }),
  )
  mockGetStyle.mockReturnValue({ metadata: { 'ebl:fallback': true } })
  const onStyleLoad = mockOn.mock.calls.find(
    ([event]) => event === 'style.load',
  )?.[1]
  act(() => onStyleLoad())
  expect(mockAddSource).toHaveBeenCalledWith(
    'ebl-findspots',
    expect.any(Object),
  )
  expect(onMapBackgroundErrorChange).toHaveBeenLastCalledWith(true)
  act(() =>
    triggerMapEvent('error', {
      error: {
        url: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      },
    }),
  )
  expect(mockSetStyle).toHaveBeenCalledTimes(1)
})

it('can install a fallback background without a status callback', () => {
  resetMapMocks()
  deferMapLoad()
  renderHarness(<HookHarness provenances={[makeProvenance()]} />)
  expect(() =>
    act(() =>
      triggerMapEvent('error', {
        error: {
          url: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
        },
      }),
    ),
  ).not.toThrow()
  expect(mockSetStyle).toHaveBeenCalledTimes(1)
})
