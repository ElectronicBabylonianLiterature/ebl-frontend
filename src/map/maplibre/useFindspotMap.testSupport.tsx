import React, { useRef } from 'react'
import { act, render, type RenderResult } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ErrorReporterContext from 'ErrorReporterContext'
import {
  mockErrorReporter,
  mockQueryRenderedFeatures,
  triggerMapEvent,
} from 'map/ui/MapTab.testSupport'
import useFindspotMap from 'map/maplibre/useFindspotMap'
import useMapCameraOwnership from 'map/maplibre/useMapCameraOwnership'

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
  cameraResetVersion = 0,
  onFindspotSelect,
  onExcavationSelect,
}: {
  withContainer?: boolean
  provenances: Parameters<typeof useFindspotMap>[1]
  onMapBackgroundErrorChange?: (hasError: boolean) => void
  cameraResetVersion?: number
  onFindspotSelect?: (id: string) => void
  onExcavationSelect?: (id: string) => void
}): JSX.Element | null {
  const ref = useRef<HTMLDivElement>(null)
  const camera = useMapCameraOwnership(provenances)
  const previousVersion = useRef(cameraResetVersion)
  if (previousVersion.current !== cameraResetVersion) {
    previousVersion.current = cameraResetVersion
    camera.claim()
  }
  useFindspotMap(ref, provenances, {
    onMapBackgroundErrorChange,
    camera,
    onFindspotSelect,
    onExcavationSelect,
  })
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
