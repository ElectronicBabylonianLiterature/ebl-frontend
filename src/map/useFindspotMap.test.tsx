import React, { useRef } from 'react'
import { act, render } from '@testing-library/react'
import {
  makeProvenance,
  mockEaseTo,
  mockGetClusterExpansionZoom,
  mockGetSource,
  mockOn,
  mockQueryRenderedFeatures,
  mockSetDOMContent,
  resetMapMocks,
  triggerMapEvent,
} from 'map/MapTab.testHelpers'
import useFindspotMap from 'map/useFindspotMap'

jest.mock('maplibre-gl')

const CLUSTER_ID_PROPERTY = 'cluster_id'
const CLUSTER = {
  type: 'Feature',
  properties: { [CLUSTER_ID_PROPERTY]: 42 },
  geometry: { type: 'Point', coordinates: [44.42, 32.542] },
}

function HookHarness({
  withContainer = true,
  provenances,
  onMapBackgroundError,
}: {
  withContainer?: boolean
  provenances: Parameters<typeof useFindspotMap>[1]
  onMapBackgroundError?: () => void
}): JSX.Element | null {
  const ref = useRef<HTMLDivElement>(null)
  useFindspotMap(ref, provenances, onMapBackgroundError)
  return withContainer ? <div ref={ref} /> : null
}

function clickCluster(): void {
  mockQueryRenderedFeatures.mockReturnValue([CLUSTER])
  act(() => {
    triggerMapEvent('click', { point: { x: 10, y: 20 } })
  })
}

describe('useFindspotMap', () => {
  beforeEach(resetMapMocks)

  it('does not initialize a map before data is ready', () => {
    render(<HookHarness provenances={null} />)

    expect(mockOn).not.toHaveBeenCalled()
  })

  it('does not initialize a map without a container', () => {
    render(
      <HookHarness withContainer={false} provenances={[makeProvenance()]} />,
    )

    expect(mockOn).not.toHaveBeenCalled()
  })

  it('does not require an error callback', () => {
    render(<HookHarness provenances={[makeProvenance()]} />)

    expect(() => {
      triggerMapEvent('error', {
        error: {
          url: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
          message: 'AJAXError: Not Found (404)',
        },
      })
    }).not.toThrow()
  })

  describe('cluster expansion', () => {
    it('does not query for expansion when the source is missing', () => {
      render(<HookHarness provenances={[makeProvenance()]} />)
      mockGetSource.mockReturnValue(undefined)

      expect(() => clickCluster()).not.toThrow()
      expect(mockGetClusterExpansionZoom).not.toHaveBeenCalled()
      expect(mockEaseTo).not.toHaveBeenCalled()
    })

    it('does not open a findspot popup for a cluster click', () => {
      render(<HookHarness provenances={[makeProvenance()]} />)
      mockGetSource.mockReturnValue({
        getClusterExpansionZoom: mockGetClusterExpansionZoom,
      })
      mockGetClusterExpansionZoom.mockResolvedValue(9)

      clickCluster()

      expect(mockSetDOMContent).not.toHaveBeenCalled()
    })

    it('does not surface an unhandled rejection when expansion fails', async () => {
      render(<HookHarness provenances={[makeProvenance()]} />)
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

      await act(async () => {
        rejectZoom(new Error('worker unavailable'))
        await Promise.resolve()
      })

      expect(mockEaseTo).not.toHaveBeenCalled()
    })

    it('does not ease the camera once the component has unmounted', async () => {
      const { unmount } = render(
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
      const onMapBackgroundError = () => undefined
      const { rerender } = render(
        <HookHarness
          provenances={[makeProvenance()]}
          onMapBackgroundError={onMapBackgroundError}
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

      const nextOnMapBackgroundError = () => undefined
      rerender(
        <HookHarness
          provenances={[makeProvenance()]}
          onMapBackgroundError={nextOnMapBackgroundError}
        />,
      )

      await act(async () => {
        resolveZoom(9)
        await Promise.resolve()
      })

      expect(mockEaseTo).not.toHaveBeenCalled()
    })
  })
})
