import React from 'react'
import { act } from '@testing-library/react'
import {
  makeProvenance,
  mockCaptureException,
  mockEaseTo,
  mockGetClusterExpansionZoom,
  mockGetSource,
  mockSetDOMContent,
  resetMapMocks,
} from 'map/MapTab.testSupport'
import {
  CLUSTER,
  HookHarness,
  clickCluster,
  renderHarness,
} from 'map/useFindspotMap.testSupport'

jest.mock('maplibre-gl')

describe('useFindspotMap cluster expansion', () => {
  beforeEach(resetMapMocks)

  it('does not query for expansion when the source is missing', () => {
    renderHarness(<HookHarness provenances={[makeProvenance()]} />)
    mockGetSource.mockReturnValue(undefined)

    expect(() => clickCluster()).not.toThrow()
    expect(mockGetClusterExpansionZoom).not.toHaveBeenCalled()
    expect(mockEaseTo).not.toHaveBeenCalled()
  })

  it('does not open a findspot popup for a cluster click', () => {
    renderHarness(<HookHarness provenances={[makeProvenance()]} />)
    mockGetSource.mockReturnValue({
      getClusterExpansionZoom: mockGetClusterExpansionZoom,
    })
    mockGetClusterExpansionZoom.mockResolvedValue(9)

    clickCluster()

    expect(mockSetDOMContent).not.toHaveBeenCalled()
  })

  it('pans to the cluster centre when the expansion zoom is unavailable', async () => {
    const unhandledRejections: unknown[] = []
    const recordRejection = (reason: unknown): void => {
      unhandledRejections.push(reason)
    }
    process.on('unhandledRejection', recordRejection)
    renderHarness(<HookHarness provenances={[makeProvenance()]} />)
    let rejectZoom!: (error: Error) => void
    mockGetSource.mockReturnValue({
      getClusterExpansionZoom: mockGetClusterExpansionZoom,
    })
    mockGetClusterExpansionZoom.mockReturnValue(
      new Promise((_resolve, reject) => {
        rejectZoom = reject
      }),
    )

    clickCluster()

    try {
      await act(async () => {
        rejectZoom(new Error('worker unavailable'))
        await new Promise((resolve) => setTimeout(resolve, 0))
      })
    } finally {
      process.off('unhandledRejection', recordRejection)
    }

    expect(mockEaseTo).toHaveBeenCalledWith({
      center: CLUSTER.geometry.coordinates,
    })
    expect(Object.keys(mockEaseTo.mock.calls[0][0])).toEqual(['center'])
    expect(mockCaptureException).toHaveBeenCalledWith(
      new Error('worker unavailable'),
    )
    expect(unhandledRejections).toEqual([])
  })

  it('does not pan a stale map generation when expansion fails', async () => {
    const { unmount } = renderHarness(
      <HookHarness provenances={[makeProvenance()]} />,
    )
    let rejectZoom!: (error: Error) => void
    mockGetSource.mockReturnValue({
      getClusterExpansionZoom: mockGetClusterExpansionZoom,
    })
    mockGetClusterExpansionZoom.mockReturnValue(
      new Promise((_resolve, reject) => {
        rejectZoom = reject
      }),
    )

    clickCluster()
    unmount()

    await act(async () => {
      rejectZoom(new Error('worker unavailable'))
      await Promise.resolve()
    })

    expect(mockEaseTo).not.toHaveBeenCalled()
  })

  it('does not ease the camera once the component has unmounted', async () => {
    const { unmount } = renderHarness(
      <HookHarness provenances={[makeProvenance()]} />,
    )
    let resolveZoom!: (zoom: number) => void
    mockGetSource.mockReturnValue({
      getClusterExpansionZoom: mockGetClusterExpansionZoom,
    })
    mockGetClusterExpansionZoom.mockReturnValue(
      new Promise((resolve) => {
        resolveZoom = resolve
      }),
    )

    clickCluster()
    unmount()

    await act(async () => {
      resolveZoom(9)
      await Promise.resolve()
    })

    expect(mockEaseTo).not.toHaveBeenCalled()
  })

  it('does not ease a stale map generation after the effect re-runs', async () => {
    const onMapBackgroundErrorChange = () => undefined
    const { rerender } = renderHarness(
      <HookHarness
        provenances={[makeProvenance()]}
        onMapBackgroundErrorChange={onMapBackgroundErrorChange}
      />,
    )
    let resolveZoom!: (zoom: number) => void
    mockGetSource.mockReturnValue({
      getClusterExpansionZoom: mockGetClusterExpansionZoom,
    })
    mockGetClusterExpansionZoom.mockReturnValue(
      new Promise((resolve) => {
        resolveZoom = resolve
      }),
    )

    clickCluster()

    const nextOnMapBackgroundErrorChange = () => undefined
    rerender(
      <HookHarness
        provenances={[makeProvenance()]}
        onMapBackgroundErrorChange={nextOnMapBackgroundErrorChange}
      />,
    )

    await act(async () => {
      resolveZoom(9)
      await Promise.resolve()
    })

    expect(mockEaseTo).not.toHaveBeenCalled()
  })
})
