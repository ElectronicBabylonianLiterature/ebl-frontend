import { act, screen } from '@testing-library/react'
import {
  makeFragmentService,
  makeProvenance,
  mockEaseTo,
  mockGetClusterExpansionZoom,
  mockGetSource,
  mockQueryRenderedFeatures,
  renderMapTab,
  resetMapMocks,
  triggerMapEvent,
} from 'map/MapTab.testSupport'

jest.mock('maplibre-gl')

beforeEach(resetMapMocks)

const clusterIdProperty = 'cluster_id'
const firstCluster = {
  type: 'Feature',
  properties: { [clusterIdProperty]: 1 },
  geometry: { type: 'Point', coordinates: [44, 33] },
}
const secondCluster = {
  type: 'Feature',
  properties: { [clusterIdProperty]: 2 },
  geometry: { type: 'Point', coordinates: [45, 34] },
}

it.each(['cluster', 'site'])(
  'keeps the newer %s click when an earlier cluster resolves late',
  async (nextClick) => {
    renderMapTab(makeFragmentService([makeProvenance()]))
    await screen.findByLabelText('Filter findspots by name')
    let finishFirst: (zoom: number) => void = () => undefined
    mockGetClusterExpansionZoom
      .mockReturnValueOnce(
        new Promise<number>((resolve) => {
          finishFirst = resolve
        }),
      )
      .mockResolvedValue(12)
    mockGetSource.mockReturnValue({
      getClusterExpansionZoom: mockGetClusterExpansionZoom,
    })
    mockQueryRenderedFeatures.mockReturnValueOnce([firstCluster])
    act(() => triggerMapEvent('click', { point: { x: 10, y: 20 } }))

    if (nextClick === 'cluster') {
      mockQueryRenderedFeatures.mockReturnValueOnce([secondCluster])
    } else {
      mockQueryRenderedFeatures.mockReturnValueOnce([]).mockReturnValueOnce([
        {
          type: 'Feature',
          properties: {
            name: 'Another site',
            abbreviation: 'Another',
            geometryType: 'point',
          },
          geometry: { type: 'Point', coordinates: [45, 34] },
        },
      ])
    }
    await act(async () => triggerMapEvent('click', { point: { x: 30, y: 40 } }))
    expect(mockEaseTo).toHaveBeenLastCalledWith({
      center: [45, 34],
      zoom: nextClick === 'cluster' ? 12 : 14,
    })
    mockEaseTo.mockClear()

    await act(async () => finishFirst(8))

    expect(mockEaseTo).not.toHaveBeenCalled()
  },
)
