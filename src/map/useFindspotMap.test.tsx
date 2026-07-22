import React, { useRef } from 'react'
import { render } from '@testing-library/react'
import type { Feature } from 'geojson'
import {
  makeProvenance,
  mockFitBounds,
  mockMapInstance,
  mockOn,
  resetMapMocks,
  triggerMapEvent,
} from './MapTab.testHelpers'
import useFindspotMap, { fitMapToData } from './useFindspotMap'

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

describe('useFindspotMap', () => {
  beforeEach(resetMapMocks)

  it('does not fit the map when there are no point features', () => {
    fitMapToData(mockMapInstance as never, [])
    fitMapToData(mockMapInstance as never, [
      { geometry: { type: 'Polygon', coordinates: [] } } as unknown as Feature,
    ])

    expect(mockFitBounds).not.toHaveBeenCalled()
  })

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
        error: { message: 'Failed to load style.json' },
      })
    }).not.toThrow()
  })
})
