import React from 'react'
import { act } from '@testing-library/react'
import {
  makeProvenance,
  mockEaseTo,
  mockGetClusterExpansionZoom,
  mockGetSource,
  mockQueryRenderedFeatures,
  resetMapMocks,
  triggerMapEvent,
} from 'map/MapTab.testSupport'
import {
  CLUSTER,
  HookHarness,
  clickCluster,
  renderHarness,
} from 'map/useFindspotMap.testSupport'

jest.mock('maplibre-gl')

beforeEach(resetMapMocks)

const CLUSTER_ID_PROPERTY = 'cluster_id'

it.each(['resolve', 'reject'] as const)(
  'keeps the newer cluster camera position when an older request %ss later',
  async (outcome) => {
    renderHarness(<HookHarness provenances={[makeProvenance()]} />)
    let resolveOlderZoom!: (zoom: number) => void
    let rejectOlderZoom!: (error: Error) => void
    const olderZoom = new Promise<number>((resolve, reject) => {
      resolveOlderZoom = resolve
      rejectOlderZoom = reject
    })
    mockGetSource.mockReturnValue({
      getClusterExpansionZoom: mockGetClusterExpansionZoom,
    })
    mockGetClusterExpansionZoom
      .mockReturnValueOnce(olderZoom)
      .mockResolvedValueOnce(11)

    clickCluster()
    const newerCenter = [45, 34]
    mockQueryRenderedFeatures.mockReturnValue([
      {
        ...CLUSTER,
        properties: { [CLUSTER_ID_PROPERTY]: 43 },
        geometry: { type: 'Point', coordinates: newerCenter },
      },
    ])
    await act(async () => {
      triggerMapEvent('click', { point: { x: 30, y: 40 } })
      await Promise.resolve()
    })
    expect(mockEaseTo).toHaveBeenCalledTimes(1)
    expect(mockEaseTo).toHaveBeenLastCalledWith({
      center: newerCenter,
      zoom: 11,
    })

    await act(async () => {
      if (outcome === 'resolve') resolveOlderZoom(9)
      else rejectOlderZoom(new Error('older worker request failed'))
      await Promise.resolve()
    })

    expect(mockEaseTo).toHaveBeenCalledTimes(1)
    expect(mockEaseTo).toHaveBeenLastCalledWith({
      center: newerCenter,
      zoom: 11,
    })
  },
)
