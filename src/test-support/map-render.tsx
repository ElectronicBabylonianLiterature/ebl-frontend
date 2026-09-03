import React from 'react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import Bluebird from 'bluebird'
import { render, RenderResult } from '@testing-library/react'
import FragmentService from 'fragmentarium/application/FragmentService'
import { FindspotService } from 'fragmentarium/application/FindspotService'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import MapTab from 'map/MapTab'
import type { FindspotMapData } from 'map/findspotMapData'

export interface MapTabHarness {
  readonly provenances?: readonly ProvenanceRecord[]
  readonly provenanceError?: string
  readonly mapData?: readonly FindspotMapData[]
  readonly mapDataError?: string
  readonly initialEntries?: readonly string[]
}

export function fragmentServiceStub(harness: MapTabHarness): FragmentService {
  return {
    fetchProvenances: () =>
      harness.provenanceError === undefined
        ? Bluebird.resolve(harness.provenances ?? [])
        : Bluebird.reject(new Error(harness.provenanceError)),
  } as unknown as FragmentService
}

export function findspotServiceStub(harness: MapTabHarness): FindspotService {
  return {
    supportsMapData: () => true,
    fetchMapData: () =>
      harness.mapDataError === undefined
        ? Bluebird.resolve(harness.mapData ?? [])
        : Bluebird.reject(new Error(harness.mapDataError)),
  } as unknown as FindspotService
}

export const MAP_LOCATION_TEST_ID = 'map-location'

function MapLocationProbe(): JSX.Element {
  return <span data-testid={MAP_LOCATION_TEST_ID}>{useLocation().search}</span>
}

export function renderMapTab(harness: MapTabHarness = {}): RenderResult {
  return render(
    <MemoryRouter initialEntries={[...(harness.initialEntries ?? ['/'])]}>
      <MapTab
        findspotService={findspotServiceStub(harness)}
        fragmentService={fragmentServiceStub(harness)}
      />
      <MapLocationProbe />
    </MemoryRouter>,
  )
}
