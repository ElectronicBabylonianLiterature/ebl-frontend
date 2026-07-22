import React from 'react'
import { act, render, screen } from '@testing-library/react'
import {
  makeFragmentService,
  makeProvenance,
  mockGetClusterExpansionZoom,
  mockGetSource,
  mockQueryRenderedFeatures,
  mockSetDOMContent,
  resetMapMocks,
  triggerMapEvent,
} from './MapTab.testHelpers'
import MapTab from './MapTab'

describe('MapTab click guards', () => {
  beforeEach(resetMapMocks)

  it('ignores clusters without a numeric cluster id', async () => {
    render(<MapTab fragmentService={makeFragmentService([makeProvenance()])} />)
    await screen.findByPlaceholderText('Filter by site name...')
    mockQueryRenderedFeatures.mockReturnValue([
      {
        properties: {},
        geometry: { type: 'Point', coordinates: [44.42, 32.542] },
      },
    ])
    mockGetSource.mockClear()

    act(() => {
      triggerMapEvent('click', { point: { x: 10, y: 20 } })
    })

    expect(mockGetSource).not.toHaveBeenCalled()
    expect(mockGetClusterExpansionZoom).not.toHaveBeenCalled()
  })

  it('ignores clicks without clusters or findspots', async () => {
    render(<MapTab fragmentService={makeFragmentService([makeProvenance()])} />)
    await screen.findByPlaceholderText('Filter by site name...')
    mockQueryRenderedFeatures.mockReturnValue([])

    act(() => {
      triggerMapEvent('click', { point: { x: 10, y: 20 } })
    })

    expect(mockQueryRenderedFeatures).toHaveBeenCalledWith(
      { x: 10, y: 20 },
      { layers: ['ebl-unclustered-points'] },
    )
    expect(mockSetDOMContent).not.toHaveBeenCalled()
  })

  it('ignores clicked findspots without point geometry', async () => {
    render(<MapTab fragmentService={makeFragmentService([makeProvenance()])} />)
    await screen.findByPlaceholderText('Filter by site name...')
    mockQueryRenderedFeatures.mockReturnValueOnce([]).mockReturnValueOnce([
      {
        type: 'Feature',
        properties: {
          name: 'Babylon',
          abbreviation: 'Bab',
          geometryType: 'point',
        },
        geometry: { type: 'LineString', coordinates: [] },
      },
    ])

    act(() => {
      triggerMapEvent('click', { point: { x: 10, y: 20 } })
    })

    expect(mockSetDOMContent).not.toHaveBeenCalled()
  })
})
