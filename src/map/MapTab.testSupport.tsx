import React from 'react'
import Bluebird from 'bluebird'
import { render, type RenderResult } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import FragmentService from 'fragmentarium/application/FragmentService'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import ErrorReporterContext, { type ErrorReporter } from 'ErrorReporterContext'
import MapTab from 'map/MapTab'

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
): FragmentService {
  return {
    fetchProvenances: () => Bluebird.resolve(provenances),
  } as unknown as FragmentService
}

export function makeFailingFragmentService(message: string): FragmentService {
  return {
    fetchProvenances: () => Bluebird.reject(new Error(message)),
  } as unknown as FragmentService
}

export function makeRejectingFragmentService(reason: unknown): FragmentService {
  return {
    fetchProvenances: () => Bluebird.reject(reason),
  } as unknown as FragmentService
}

export const CURRENT_LOCATION_TEST_ID = 'current-location'
const MAP_ROUTE = '/tools/map'

function CurrentLocation(): JSX.Element {
  const location = useLocation()
  return (
    <div data-testid={CURRENT_LOCATION_TEST_ID}>
      {`${location.pathname}${location.search}`}
    </div>
  )
}

function MapRoute({
  fragmentService,
}: {
  fragmentService: FragmentService
}): JSX.Element | null {
  const location = useLocation()
  return location.pathname === MAP_ROUTE ? (
    <MapTab fragmentService={fragmentService} />
  ) : null
}

export function renderMapTab(
  fragmentService: FragmentService,
  initialEntry: string = MAP_ROUTE,
): RenderResult {
  return render(
    <ErrorReporterContext.Provider value={mockErrorReporter}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <MapRoute fragmentService={fragmentService} />
        <CurrentLocation />
      </MemoryRouter>
    </ErrorReporterContext.Provider>,
  )
}
