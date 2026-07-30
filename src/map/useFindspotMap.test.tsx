import React, { useRef } from 'react'
import { render } from '@testing-library/react'
import {
  makeProvenance,
  mockOn,
  resetMapMocks,
  triggerMapEvent,
} from 'map/MapTab.testHelpers'
import useFindspotMap from 'map/useFindspotMap'

jest.mock('maplibre-gl')

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
        resourceType: 'style',
        error: {
          message:
            'Failed to fetch https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
        },
      })
    }).not.toThrow()
  })
})
