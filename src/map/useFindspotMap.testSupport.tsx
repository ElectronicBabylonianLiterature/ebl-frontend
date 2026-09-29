import React, { useRef } from 'react'
import { act, render, type RenderResult } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ErrorReporterContext from 'ErrorReporterContext'
import {
  mockErrorReporter,
  mockQueryRenderedFeatures,
  triggerMapEvent,
} from 'map/MapTab.testSupport'
import useFindspotMap from 'map/useFindspotMap'

const CLUSTER_ID_PROPERTY = 'cluster_id'

export const CLUSTER = {
  type: 'Feature',
  properties: { [CLUSTER_ID_PROPERTY]: 42 },
  geometry: { type: 'Point', coordinates: [44.42, 32.542] },
}

export function HookHarness({
  withContainer = true,
  provenances,
  onMapBackgroundErrorChange,
}: {
  withContainer?: boolean
  provenances: Parameters<typeof useFindspotMap>[1]
  onMapBackgroundErrorChange?: (hasError: boolean) => void
}): JSX.Element | null {
  const ref = useRef<HTMLDivElement>(null)
  useFindspotMap(ref, provenances, onMapBackgroundErrorChange)
  return withContainer ? <div ref={ref} /> : null
}

function Providers({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <ErrorReporterContext.Provider value={mockErrorReporter}>
      <MemoryRouter>{children}</MemoryRouter>
    </ErrorReporterContext.Provider>
  )
}

export function renderHarness(ui: JSX.Element): RenderResult {
  return render(ui, { wrapper: Providers })
}

export function clickCluster(): void {
  mockQueryRenderedFeatures.mockReturnValue([CLUSTER])
  act(() => {
    triggerMapEvent('click', { point: { x: 10, y: 20 } })
  })
}
