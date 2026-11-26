import { aggregateFindspotMapData } from 'fragmentarium/domain/findspotMapDataSanitizer'
import type { FragmentMapDataState } from 'map/domain/useFragmentMapData'
import { polygonLinkedData } from 'map/domain/polygonLinkedData'

const summaries = aggregateFindspotMapData([])
const data: FragmentMapDataState = {
  sites: new Map([
    [
      'assur',
      { status: 'loaded-empty', findspots: [], polygonSummaries: summaries },
    ],
  ]),
  findspots: [],
  polygonSummaries: summaries,
}

it.each([
  ['an unknown site', 'unknown', 'not-configured'],
  ['a map site without loaded state', 'nippur', 'not-configured'],
  ['a loaded map site', 'assur', 'loaded-empty'],
])('looks up linked data for %s', (_label, siteId, status) => {
  expect(polygonLinkedData(data, { siteId, polygonId: 'area-a' })).toEqual({
    summary: undefined,
    status,
  })
})

it('returns the summary of a loaded polygon', () => {
  const summary = {
    findspotCount: 1,
    accessibleFragmentCount: 3,
    findspots: [],
  }
  const loaded: FragmentMapDataState = {
    ...data,
    sites: new Map([
      [
        'assur',
        {
          status: 'loaded-with-mappings',
          findspots: [],
          polygonSummaries: new Map([['area-a', summary]]),
        },
      ],
    ]),
  } as unknown as FragmentMapDataState
  expect(
    polygonLinkedData(loaded, { siteId: 'assur', polygonId: 'area-a' }),
  ).toEqual({ summary, status: 'loaded-with-mappings' })
})
