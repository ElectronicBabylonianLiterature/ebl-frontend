import React from 'react'
import type { FeatureCollection } from 'geojson'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
  deferMapLoad,
  makeFragmentService,
  makeProvenance,
  mockAddSource,
  mockFitBounds,
  mockGetSource,
  mockIsStyleLoaded,
  mockSetData,
  resetMapMocks,
  triggerMapEvent,
} from 'map/MapTab.testHelpers'
import MapTab from 'map/MapTab'

jest.mock('maplibre-gl')

describe('MapTab filtering', () => {
  beforeEach(resetMapMocks)

  it('filters provenances case-insensitively', async () => {
    const provenances = [
      makeProvenance({ id: 'babylon', longName: 'Babylon' }),
      makeProvenance({ id: 'nippur', longName: 'Nippur' }),
      makeProvenance({ id: 'uruk', longName: 'Uruk' }),
    ]
    mockGetSource.mockReturnValue({ setData: mockSetData })

    render(<MapTab fragmentService={makeFragmentService(provenances)} />)

    const input = await screen.findByPlaceholderText('Filter by site name...')
    await userEvent.type(input, 'bab')

    await waitFor(() => {
      expect(mockSetData).toHaveBeenCalled()
    })
    const setDataCall = mockSetData.mock.calls[
      mockSetData.mock.calls.length - 1
    ][0] as FeatureCollection
    expect(setDataCall.features).toHaveLength(1)
    expect(setDataCall.features[0].properties?.name).toBe('Babylon')
  })

  it('updates the source without re-fitting the camera on each filter change', async () => {
    const provenances = [
      makeProvenance({ id: 'babylon', longName: 'Babylon' }),
      makeProvenance({ id: 'nippur', longName: 'Nippur' }),
    ]
    mockGetSource.mockReturnValue({ setData: mockSetData })

    render(<MapTab fragmentService={makeFragmentService(provenances)} />)

    const input = await screen.findByPlaceholderText('Filter by site name...')
    await waitFor(() => expect(mockFitBounds).toHaveBeenCalledTimes(1))

    await userEvent.type(input, 'bab')

    await waitFor(() => {
      expect(mockSetData).toHaveBeenCalled()
    })
    expect(mockFitBounds).toHaveBeenCalledTimes(1)
  })

  it('uses the active filter when the style loads after filtering', async () => {
    const provenances = [
      makeProvenance({ id: 'babylon', longName: 'Babylon' }),
      makeProvenance({ id: 'nippur', longName: 'Nippur' }),
    ]
    deferMapLoad()
    mockIsStyleLoaded.mockReturnValue(false)

    render(<MapTab fragmentService={makeFragmentService(provenances)} />)

    const input = await screen.findByPlaceholderText('Filter by site name...')
    await userEvent.type(input, 'bab')
    expect(mockAddSource).not.toHaveBeenCalled()

    act(() => {
      triggerMapEvent('load')
    })

    expect(mockAddSource).toHaveBeenCalledTimes(1)
    const source = mockAddSource.mock.calls[0][1]
    expect(source.data.features).toHaveLength(1)
    expect(source.data.features[0].properties.name).toBe('Babylon')
  })
})
