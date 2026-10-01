import React from 'react'
import { render, type RenderResult } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { ProvenanceSource } from 'map/ui/useProvenances'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import ErrorReporterContext, { type ErrorReporter } from 'ErrorReporterContext'
import MapTab from 'map/ui/MapTab'

export const mockCaptureException = jest.fn()

export const mockErrorReporter: ErrorReporter = {
  captureException: mockCaptureException,
  showReportDialog: jest.fn(),
  setUser: jest.fn(),
  clearScope: jest.fn(),
}

export * from 'map/testSupport/mapLibreMock'
export { makeProvenance } from 'map/testFixtures/provenance'

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

function CurrentLocation(): JSX.Element {
  const location = useLocation()
  return (
    <div data-testid={CURRENT_LOCATION_TEST_ID}>
      {`${location.pathname}${location.search}`}
    </div>
  )
}

export function renderMapTab(fragmentService: ProvenanceSource): RenderResult {
  return render(
    <ErrorReporterContext.Provider value={mockErrorReporter}>
      <MemoryRouter>
        <MapTab fragmentService={fragmentService} />
        <CurrentLocation />
      </MemoryRouter>
    </ErrorReporterContext.Provider>,
  )
}
