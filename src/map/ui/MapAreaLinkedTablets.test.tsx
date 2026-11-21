import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import MapAreaLinkedTablets from 'map/ui/MapAreaLinkedTablets'
import type { FragmentMapDataState } from 'map/domain/useFragmentMapData'
import { aggregateFindspotMapData } from 'fragmentarium/domain/findspotMapDataSanitizer'
import {
  excavationPolygon,
  findspotMapDataDto,
} from 'test-support/map-fixtures'

it.each(['unknown-site', 'assur'])(
  'shows not-configured status without links when site %s has no data state',
  (siteId) => {
    const data: FragmentMapDataState = {
      sites: new Map(),
      findspots: [],
      polygonSummaries: new Map(),
    }
    render(
      <MemoryRouter>
        <MapAreaLinkedTablets
          polygon={excavationPolygon({ siteId })}
          data={data}
        />
      </MemoryRouter>,
    )

    expect(screen.getByRole('status')).toHaveTextContent(
      'No linked tablet data is configured for this site yet.',
    )
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  },
)

it('uses the selected canonical polygon summary for counts and exact-findspot links', () => {
  const findspots = [findspotMapDataDto()]
  const polygonSummaries = aggregateFindspotMapData(findspots)
  const data: FragmentMapDataState = {
    sites: new Map([
      [
        'assur',
        { status: 'loaded-with-mappings', findspots, polygonSummaries },
      ],
    ]),
    findspots,
    polygonSummaries,
  }
  render(
    <MemoryRouter>
      <MapAreaLinkedTablets polygon={excavationPolygon()} data={data} />
    </MemoryRouter>,
  )

  expect(screen.getByRole('status')).toHaveTextContent(
    '2 accessible tablets across 1 findspot.',
  )
  expect(screen.getByRole('link')).toHaveAttribute(
    'href',
    '/library/search?findspotId=1',
  )
})
