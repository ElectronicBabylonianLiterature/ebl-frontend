import React from 'react'
import { render, type RenderResult } from '@testing-library/react'
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom'
import { ProvenanceSource } from 'map/useProvenances'
import { FindspotService } from 'fragmentarium/application/FindspotService'
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
  } as unknown as ProvenanceSource
}

export function makeFailingFragmentService(message: string): ProvenanceSource {
  return {
    fetchProvenances: () => Promise.reject(new Error(message)),
  } as unknown as ProvenanceSource
}

export function makeRejectingFragmentService(
  reason: unknown,
): ProvenanceSource {
  return {
    fetchProvenances: () => Promise.reject(reason),
  } as unknown as ProvenanceSource
}

const DEFAULT_FINDSPOT_SERVICE = {
  fetchMapData: () => Promise.resolve([]),
} as unknown as FindspotService

export const CURRENT_LOCATION_TEST_ID = 'current-location'
const MAP_ROUTE = '/tools/map'

function CurrentLocation(): JSX.Element {
  const navigate = useNavigate()
  return (
    <>
      <LocationDisplay testId={CURRENT_LOCATION_TEST_ID} />
      <button type="button" onClick={() => navigate('/tools/map?mv=1&areas=1')}>
        Navigate without selection
      </button>
    </>
  )
}

function MapRoute({
  fragmentService,
  findspotService,
}: {
  readonly fragmentService: ProvenanceSource
  readonly findspotService: FindspotService
}): JSX.Element | null {
  const location = useLocation()
  return location.pathname === MAP_ROUTE ? (
    <MapTab
      findspotService={findspotService}
      fragmentService={fragmentService}
    />
  ) : null
}

export function renderMapTab(
  fragmentService: ProvenanceSource,
  initialEntryOrFindspotService: string | FindspotService = MAP_ROUTE,
  findspotService: FindspotService = DEFAULT_FINDSPOT_SERVICE,
): RenderResult {
  const initialEntry =
    typeof initialEntryOrFindspotService === 'string'
      ? initialEntryOrFindspotService
      : MAP_ROUTE
  const selectedFindspotService =
    typeof initialEntryOrFindspotService === 'string'
      ? findspotService
      : initialEntryOrFindspotService

  return render(
    <ErrorReporterContext.Provider value={mockErrorReporter}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <MapRoute
          fragmentService={fragmentService}
          findspotService={selectedFindspotService}
        />
        <CurrentLocation />
      </MemoryRouter>
    </ErrorReporterContext.Provider>,
  )
}
