import React from 'react'
import Bluebird from 'bluebird'
import { render, type RenderResult } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import FragmentService from 'fragmentarium/application/FragmentService'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import MapTab from 'map/MapTab'

export * from 'map/testSupport/mapLibreMock'
export { makeProvenance } from 'map/testFixtures/provenance'

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

export function renderMapTab(fragmentService: FragmentService): RenderResult {
  return render(
    <MemoryRouter>
      <MapTab fragmentService={fragmentService} />
    </MemoryRouter>,
  )
}
