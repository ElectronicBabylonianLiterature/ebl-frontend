import React from 'react'
import { act } from '@testing-library/react'
import {
  deferMapLoad,
  failMapConstruction,
  makeProvenance,
  mockAddSource,
  mockCaptureException,
  mockOn,
  resetMapMocks,
  triggerMapEvent,
} from 'map/MapTab.testSupport'
import {
  HookHarness,
  renderHarness,
} from 'map/useFindspotMap.testSupport'

jest.mock('maplibre-gl')

describe('useFindspotMap', () => {
  beforeEach(resetMapMocks)

  it('does not initialize a map before data is ready', () => {
    renderHarness(<HookHarness provenances={null} />)

    expect(mockOn).not.toHaveBeenCalled()
  })

  it('does not initialize a map without a container', () => {
    renderHarness(
      <HookHarness withContainer={false} provenances={[makeProvenance()]} />,
    )

    expect(mockOn).not.toHaveBeenCalled()
  })

  it('does not initialize a source when the data is gone before the style loads', () => {
    deferMapLoad()
    const { rerender } = renderHarness(
      <HookHarness provenances={[makeProvenance()]} />,
    )

    rerender(<HookHarness provenances={null} />)
    act(() => {
      triggerMapEvent('load')
    })

    expect(mockAddSource).not.toHaveBeenCalled()
  })

  it('does not require an error callback', () => {
    renderHarness(<HookHarness provenances={[makeProvenance()]} />)

    expect(() => {
      triggerMapEvent('error', {
        error: {
          url: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
          message: 'AJAXError: Not Found (404)',
        },
      })
    }).not.toThrow()
  })

  it('reports a construction failure and signals a background error', () => {
    const onMapBackgroundErrorChange = jest.fn()
    failMapConstruction(new Error('Failed to initialize WebGL'))

    expect(() =>
      renderHarness(
        <HookHarness
          provenances={[makeProvenance()]}
          onMapBackgroundErrorChange={onMapBackgroundErrorChange}
        />,
      ),
    ).not.toThrow()

    expect(onMapBackgroundErrorChange).toHaveBeenCalledWith(true)
    expect(mockCaptureException).toHaveBeenCalledWith(
      new Error('Failed to initialize WebGL'),
    )
    expect(mockOn).not.toHaveBeenCalled()
  })

  it('reports a source or layer error through the error reporter', () => {
    renderHarness(<HookHarness provenances={[makeProvenance()]} />)

    triggerMapEvent('error', {
      error: { message: 'Invalid GeoJSON' },
      sourceId: 'ebl-findspots',
    })

    expect(mockCaptureException).toHaveBeenCalledWith(
      new Error('Invalid GeoJSON'),
    )
  })

  it('does not report a recoverable tile miss', () => {
    renderHarness(<HookHarness provenances={[makeProvenance()]} />)

    triggerMapEvent('error', {
      error: { message: 'Not Found' },
      sourceId: 'ebl-findspots',
      tile: {},
    })

    expect(mockCaptureException).not.toHaveBeenCalled()
  })
})
