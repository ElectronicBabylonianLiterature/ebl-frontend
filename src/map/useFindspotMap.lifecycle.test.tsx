import React from 'react'
import { act } from '@testing-library/react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import {
  deferMapLoad,
  failMapConstruction,
  makeProvenance,
  mockAddSource,
  mockCanvas,
  mockCaptureException,
  mockGetClusterExpansionZoom,
  mockMapInstance,
  mockOff,
  mockOn,
  mockQueryRenderedFeatures,
  mockRemove,
  mockSetDOMContent,
  resetMapMocks,
  triggerMapEvent,
} from 'map/MapTab.testSupport'
import { MAP_STYLE_LOAD_EVENT } from 'map/mapLayers'
import { initializeFindspotMap } from 'map/mapFindspotLifecycle'
import {
  CLUSTER,
  HookHarness,
  renderHarness,
} from 'map/useFindspotMap.testSupport'

jest.mock('maplibre-gl')

describe('findspot map lifecycle', () => {
  beforeEach(resetMapMocks)

  it('normalizes a construction failure without an error callback', () => {
    failMapConstruction('WebGL is unavailable')

    renderHarness(<HookHarness provenances={[makeProvenance()]} />)

    expect(mockCaptureException).toHaveBeenCalledWith(
      new Error('WebGL is unavailable'),
    )
    expect(mockOn).not.toHaveBeenCalled()
  })

  it('uses the latest data on deferred style load and removes every listener', () => {
    deferMapLoad()
    const mapRef: { current: MapLibreMap | null } = { current: null }
    const initialProvenances = [makeProvenance()]
    let provenances: typeof initialProvenances | null = initialProvenances
    const onBackgroundErrorChange = jest.fn()
    const dispose = initializeFindspotMap(
      document.createElement('div'),
      mapRef,
      {
        getState: () => ({
          provenances,
          isInteractionEnabled: true,
          interactionVersion: 0,
          cameraResetVersion: 0,
          cameraResetProvenances: initialProvenances,
        }),
        navigate: jest.fn(),
        reportError: jest.fn(),
        onBackgroundErrorChange,
      },
    )
    expect(mapRef.current).toBe(mockMapInstance)
    provenances = null

    triggerMapEvent(MAP_STYLE_LOAD_EVENT)

    expect(onBackgroundErrorChange).toHaveBeenCalledWith(false)
    expect(mockAddSource).not.toHaveBeenCalled()
    expect(dispose).toBeDefined()
    dispose?.()
    expect(mapRef.current).toBeNull()
    expect(mockRemove).toHaveBeenCalledTimes(1)
    expect(mockOff.mock.calls).toHaveLength(mockOn.mock.calls.length)
    mockOn.mock.calls.forEach((subscription) => {
      expect(mockOff).toHaveBeenCalledWith(...subscription)
    })
    onBackgroundErrorChange.mockClear()
    triggerMapEvent(MAP_STYLE_LOAD_EVENT)
    triggerMapEvent('mousemove', { point: { x: 0, y: 0 } })
    expect(onBackgroundErrorChange).not.toHaveBeenCalled()
    expect(mockQueryRenderedFeatures).not.toHaveBeenCalled()
  })

  it('ignores background clicks and clusters without a numeric identifier', () => {
    renderHarness(<HookHarness provenances={[makeProvenance()]} />)
    triggerMapEvent('click', { point: { x: 0, y: 0 } })
    mockQueryRenderedFeatures.mockReturnValue([{ ...CLUSTER, properties: {} }])
    triggerMapEvent('click', { point: { x: 0, y: 0 } })

    expect(mockGetClusterExpansionZoom).not.toHaveBeenCalled()
    expect(mockSetDOMContent).not.toHaveBeenCalled()
  })

  it('keeps pointer and click handlers disabled while another tool owns input', () => {
    renderHarness(
      <HookHarness
        provenances={[makeProvenance()]}
        isInteractionEnabled={false}
      />,
    )
    mockCanvas.style.cursor = 'pointer'

    act(() => {
      triggerMapEvent('mousemove', { point: { x: 0, y: 0 } })
      triggerMapEvent('mouseenter', undefined, 'ebl-clusters')
      triggerMapEvent('click', { point: { x: 0, y: 0 } })
    })

    expect(mockCanvas).toHaveStyle({ cursor: '' })
    expect(mockQueryRenderedFeatures).not.toHaveBeenCalled()
    expect(mockSetDOMContent).not.toHaveBeenCalled()
  })
})
