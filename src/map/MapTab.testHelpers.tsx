import Bluebird from 'bluebird'
import FragmentService from 'fragmentarium/application/FragmentService'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import {
  deferMapLoad,
  mockAddControl,
  mockAddLayer,
  mockAddSource,
  mockBoundsExtend,
  mockCanvas,
  mockEaseTo,
  mockFitBounds,
  mockGetCanvas,
  mockGetClusterExpansionZoom,
  mockGetSource,
  mockIsStyleLoaded,
  mockMapInstance,
  mockOff,
  mockOn,
  mockPopupAddTo,
  mockQueryRenderedFeatures,
  mockRemove,
  mockSetData,
  mockSetDOMContent,
  mockSetHTML,
  mockSetLngLat,
  resetMapMocks,
  triggerMapEvent,
  type MockErrorEvent,
  type MockMapEvent,
} from 'map/testSupport/mapLibreMock'
import { makeProvenance } from 'map/testFixtures/provenance'

export {
  deferMapLoad,
  makeProvenance,
  mockAddControl,
  mockAddLayer,
  mockAddSource,
  mockBoundsExtend,
  mockCanvas,
  mockEaseTo,
  mockFitBounds,
  mockGetCanvas,
  mockGetClusterExpansionZoom,
  mockGetSource,
  mockIsStyleLoaded,
  mockMapInstance,
  mockOff,
  mockOn,
  mockPopupAddTo,
  mockQueryRenderedFeatures,
  mockRemove,
  mockSetData,
  mockSetDOMContent,
  mockSetHTML,
  mockSetLngLat,
  resetMapMocks,
  triggerMapEvent,
  type MockErrorEvent,
  type MockMapEvent,
}

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
