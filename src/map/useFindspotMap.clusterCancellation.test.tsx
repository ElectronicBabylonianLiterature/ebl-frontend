import React from 'react'
import { act } from '@testing-library/react'
import {
  makeProvenance,
  mockEaseTo,
  mockGetClusterExpansionZoom,
  mockGetSource,
  resetMapMocks,
} from 'map/MapTab.testSupport'
import {
  CLUSTER,
  HookHarness,
  clickCluster,
  renderHarness,
} from 'map/useFindspotMap.testSupport'

jest.mock('maplibre-gl')

beforeEach(resetMapMocks)

it.each(['resolve', 'reject'] as const)(
  'does not pan when an earlier expansion %ss after a tool takes and releases interaction ownership',
  async (outcome) => {
    const provenances = [makeProvenance()]
    const { rerender } = renderHarness(
      <HookHarness provenances={provenances} isInteractionEnabled />,
    )
    let resolveZoom!: (zoom: number) => void
    let rejectZoom!: (error: Error) => void
    mockGetSource.mockReturnValue({
      getClusterExpansionZoom: mockGetClusterExpansionZoom,
    })
    mockGetClusterExpansionZoom.mockReturnValue(
      new Promise<number>((resolve, reject) => {
        resolveZoom = resolve
        rejectZoom = reject
      }),
    )

    clickCluster()
    rerender(
      <HookHarness provenances={provenances} isInteractionEnabled={false} />,
    )
    rerender(<HookHarness provenances={provenances} isInteractionEnabled />)
    await act(async () => {
      if (outcome === 'resolve') resolveZoom(9)
      else rejectZoom(new Error('worker unavailable'))
      await Promise.resolve()
    })

    expect(mockEaseTo).not.toHaveBeenCalled()

    mockGetClusterExpansionZoom.mockResolvedValue(10)
    await act(async () => {
      clickCluster()
      await Promise.resolve()
    })

    expect(mockEaseTo).toHaveBeenCalledTimes(1)
    expect(mockEaseTo).toHaveBeenCalledWith({
      center: CLUSTER.geometry.coordinates,
      zoom: 10,
    })
  },
)
