import React from 'react'
import { render, type RenderResult } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { ProvenanceSource } from 'map/useProvenances'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import ErrorReporterContext, { type ErrorReporter } from 'ErrorReporterContext'
import MapTab from 'map/MapTab'
import LocationDisplay from 'test-support/LocationDisplay'

export const mockCaptureException = jest.fn()

export const mockErrorReporter: ErrorReporter = {
  captureException: mockCaptureException,
  showReportDialog: jest.fn(),
  setUser: jest.fn(),
  clearScope: jest.fn(),
}

export * from 'map/mapLibreMock.testSupport'
export { makeProvenance } from 'map/provenanceTestData'

export function makeFragmentService(
  provenances: readonly ProvenanceRecord[],
): ProvenanceSource {
  return {
    fetchProvenances: () => Promise.resolve(provenances),
  }
}

export function makeFailingFragmentService(message: string): ProvenanceSource {
  return {
    fetchProvenances: () => Promise.reject(new Error(message)),
  }
}

export function makeRejectingFragmentService(reason: string): ProvenanceSource {
  return {
    fetchProvenances: () => Promise.reject(reason),
  }
}

export const CURRENT_LOCATION_TEST_ID = 'current-location'
const MAP_ROUTE = '/tools/map'

function MapRoute({
  fragmentService,
}: {
  fragmentService: ProvenanceSource
}): JSX.Element | null {
  const location = useLocation()
  return location.pathname === MAP_ROUTE ? (
    <MapTab fragmentService={fragmentService} />
  ) : null
}

export function renderMapTab(
  fragmentService: ProvenanceSource,
  initialEntry: string = MAP_ROUTE,
): RenderResult {
  return render(
    <ErrorReporterContext.Provider value={mockErrorReporter}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <MapRoute fragmentService={fragmentService} />
        <LocationDisplay testId={CURRENT_LOCATION_TEST_ID} />
      </MemoryRouter>
    </ErrorReporterContext.Provider>,
  )
}
