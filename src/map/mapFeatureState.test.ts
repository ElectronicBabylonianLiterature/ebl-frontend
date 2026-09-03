import { asLibreMap, createMapMock } from 'test-support/maplibre-map-helpers'
import type { MapGeoJSONFeature } from 'maplibre-gl'
import { resetMapLibreMock } from '__mocks__/maplibre-gl'
import { EXCAVATION_AREAS_SOURCE_ID, SOURCE_ID } from './mapLayers'
import {
  applyFindspotSummaryState,
  applySelectionState,
  featureStringProperty,
  selectedPolygonId,
  selectedSiteId,
} from './mapFeatureState'
import { aggregateFindspotMapData } from './findspotMapData'
import { buildVisualizationValues } from './mapVisualizationValues'
import { EVIDENCE_CODES } from './mapEvidencePaint'
import { excavationPolygon, findspotMapData } from 'test-support/map-fixtures'

beforeEach(() => {
  resetMapLibreMock()
})

describe('featureStringProperty', () => {
  it('reads a string property', () => {
    expect(
      featureStringProperty(
        { properties: { name: 'Area A' } } as unknown as MapGeoJSONFeature,
        'name',
      ),
    ).toBe('Area A')
  })

  it.each([
    ['a non-string value', { properties: { name: 7 } }],
    ['a missing property', { properties: {} }],
    ['absent properties', {}],
  ])('returns null for %s', (_label, feature) => {
    expect(
      featureStringProperty(feature as unknown as MapGeoJSONFeature, 'name'),
    ).toBeNull()
  })
})

describe('selection accessors', () => {
  it('reads a site selection', () => {
    const selection = { type: 'site', provenanceId: 'babylon' } as const

    expect(selectedSiteId(selection)).toBe('babylon')
    expect(selectedPolygonId(selection)).toBeNull()
  })

  it('reads an excavation-area selection', () => {
    const selection = {
      type: 'excavation-area',
      polygonId: 'assur-area-a',
    } as const

    expect(selectedPolygonId(selection)).toBe('assur-area-a')
    expect(selectedSiteId(selection)).toBeNull()
  })

  it('handles no selection', () => {
    expect(selectedSiteId(null)).toBeNull()
    expect(selectedPolygonId(null)).toBeNull()
  })
})

describe('applyFindspotSummaryState', () => {
  it('writes authorized counts as feature state', () => {
    const map = createMapMock()

    applyFindspotSummaryState(
      asLibreMap(map),
      buildVisualizationValues(
        aggregateFindspotMapData([
          findspotMapData({ polygonIds: ['assur-area-a'] }),
        ]),
        new Map([
          ['assur', [excavationPolygon({ polygonId: 'assur-area-a' })]],
        ]),
      ),
    )

    expect(
      map.getFeatureState({
        source: EXCAVATION_AREAS_SOURCE_ID,
        id: 'assur-area-a',
      }),
    ).toEqual({
      accessibleFragmentCount: 4,
      findspotCount: 1,
      evidenceCode: EVIDENCE_CODES['verified-source'],
      densityPerSquareKm: 5,
    })
  })
})

describe('applySelectionState', () => {
  const none = { polygonId: null, siteId: null }

  it('marks a newly selected polygon', () => {
    const map = createMapMock()

    const next = applySelectionState(
      asLibreMap(map),
      { type: 'excavation-area', polygonId: 'assur-area-a' },
      none,
    )

    expect(next).toEqual({ polygonId: 'assur-area-a', siteId: null })
    expect(
      map.getFeatureState({
        source: EXCAVATION_AREAS_SOURCE_ID,
        id: 'assur-area-a',
      }),
    ).toEqual({ selected: true })
  })

  it('clears the previously selected polygon', () => {
    const map = createMapMock()

    applySelectionState(asLibreMap(map), null, {
      polygonId: 'assur-area-a',
      siteId: null,
    })

    expect(
      map.getFeatureState({
        source: EXCAVATION_AREAS_SOURCE_ID,
        id: 'assur-area-a',
      }),
    ).toEqual({ selected: false })
  })

  it('moves the selection between sites', () => {
    const map = createMapMock()

    const next = applySelectionState(
      asLibreMap(map),
      { type: 'site', provenanceId: 'assur' },
      { polygonId: null, siteId: 'babylon' },
    )

    expect(next).toEqual({ polygonId: null, siteId: 'assur' })
    expect(map.getFeatureState({ source: SOURCE_ID, id: 'babylon' })).toEqual({
      selected: false,
    })
    expect(map.getFeatureState({ source: SOURCE_ID, id: 'assur' })).toEqual({
      selected: true,
    })
  })

  it('leaves an unchanged selection alone', () => {
    const map = createMapMock()
    const setFeatureState = jest.spyOn(map, 'setFeatureState')

    applySelectionState(
      asLibreMap(map),
      { type: 'site', provenanceId: 'babylon' },
      { polygonId: null, siteId: 'babylon' },
    )

    expect(setFeatureState).toHaveBeenCalledTimes(1)
  })
})
