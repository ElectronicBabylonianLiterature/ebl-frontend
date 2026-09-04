import { act, screen } from '@testing-library/react'

import {
  makeFragmentService,
  makeProvenance,
  mockGetClusterExpansionZoom,
  mockGetSource,
  mockQueryRenderedFeatures,
  mockSetDOMContent,
  renderMapTab,
  resetMapMocks,
  triggerMapEvent,
} from 'map/ui/MapTab.testSupport'

jest.mock('maplibre-gl')

describe('MapTab click guards', () => {
  beforeEach(resetMapMocks)

  it('ignores clusters without a numeric cluster id', async () => {
    renderMapTab(makeFragmentService([makeProvenance()]))
    await screen.findByLabelText('Filter findspots by name')
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

  it('ignores a cluster click when the source is missing', async () => {
    const clusterIdProperty = 'cluster_id'
    renderMapTab(makeFragmentService([makeProvenance()]))
    await screen.findByLabelText('Filter findspots by name')
    mockQueryRenderedFeatures.mockReturnValue([
      {
        properties: { [clusterIdProperty]: 42 },
        geometry: { type: 'Point', coordinates: [44.42, 32.542] },
      },
    ])
    mockGetSource.mockReturnValue(undefined)

    expect(() => {
      act(() => {
        triggerMapEvent('click', { point: { x: 10, y: 20 } })
      })
    }).not.toThrow()

    expect(mockGetClusterExpansionZoom).not.toHaveBeenCalled()
  })

  it('ignores clicks without clusters or findspots', async () => {
    renderMapTab(makeFragmentService([makeProvenance()]))
    await screen.findByLabelText('Filter findspots by name')
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
    renderMapTab(makeFragmentService([makeProvenance()]))
    await screen.findByLabelText('Filter findspots by name')
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
