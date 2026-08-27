import React from 'react'
import { act } from '@testing-library/react'
import {
  deferMapLoad,
  makeProvenance,
  mockAddSource,
  mockOn,
  resetMapMocks,
  triggerMapEvent,
} from 'map/ui/MapTab.testSupport'
import {
  HookHarness,
  renderHarness,
} from 'map/maplibre/useFindspotMap.testSupport'

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
})
