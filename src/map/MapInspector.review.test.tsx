import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import MapInspector from 'map/MapInspector'
import { aggregateFindspotMapData } from 'fragmentarium/domain/findspotMapDataSanitizer'
import {
  excavationPolygon,
  findspotMapDataDto,
} from 'test-support/map-fixtures'

it.each(['Evidence', 'Findspots'])(
  'keeps unavailable text accessible inside the %s panel',
  async (tab) => {
    render(
      <MemoryRouter>
        <MapInspector
          visualizationMode="mapped"
          siteFilter=""
          polygon={excavationPolygon()}
          siteName="Assur"
          summary={undefined}
          status="error"
          onClear={jest.fn()}
        />
      </MemoryRouter>,
    )
    await userEvent.click(screen.getByRole('tab', { name: tab }))
    const message = within(screen.getByRole('tabpanel')).getByText(
      'Linked tablet data is unavailable right now.',
    )
    expect(message).not.toHaveAttribute('aria-hidden')
  },
)

it('expands all mapped findspots and clears the selection through the inspector', async () => {
  const polygon = excavationPolygon()
  const rows = Array.from({ length: 12 }, (_, index) =>
    findspotMapDataDto({ findspotId: index, polygonIds: [polygon.polygonId] }),
  )
  const onClear = jest.fn()
  render(
    <MemoryRouter>
      <MapInspector
        visualizationMode="mapped"
        siteFilter=""
        polygon={polygon}
        siteName="Assur"
        summary={aggregateFindspotMapData(rows).get(polygon.polygonId)}
        status="loaded-with-mappings"
        onClear={onClear}
      />
    </MemoryRouter>,
  )
  await userEvent.click(screen.getByRole('tab', { name: 'Findspots' }))
  expect(
    within(screen.getByRole('tabpanel')).getAllByRole('link'),
  ).toHaveLength(10)
  await userEvent.click(screen.getByRole('button', { name: 'Show all 12' }))
  expect(
    within(screen.getByRole('tabpanel')).getAllByRole('link'),
  ).toHaveLength(12)
  await userEvent.click(screen.getByRole('button', { name: 'Clear selection' }))
  expect(onClear).toHaveBeenCalledTimes(1)
})

it.each([
  ['curated', 'Curated mapping'],
  ['verified-source', 'Verified-source mapping'],
  ['mixed', 'Mixed mapping evidence'],
] as const)(
  'renders %s evidence and its completeness explanation',
  async (method, label) => {
    const polygon = excavationPolygon()
    const rows = [
      findspotMapDataDto({
        findspotId: 1,
        polygonIds: [polygon.polygonId],
        matchMethod: method === 'mixed' ? 'curated' : method,
      }),
    ]
    if (method === 'mixed')
      rows.push(
        findspotMapDataDto({
          findspotId: 2,
          polygonIds: [polygon.polygonId],
          matchMethod: 'verified-source',
        }),
      )
    render(
      <MemoryRouter>
        <MapInspector
          visualizationMode="mapped"
          siteFilter=""
          polygon={polygon}
          siteName="Assur"
          summary={aggregateFindspotMapData(rows).get(polygon.polygonId)}
          status="loaded-with-mappings"
          onClear={jest.fn()}
        />
      </MemoryRouter>,
    )
    await userEvent.click(screen.getByRole('tab', { name: 'Evidence' }))
    expect(within(screen.getByRole('tabpanel')).getByText(label)).toBeVisible()
    expect(screen.getByText('Excavation area')).toBeVisible()
    await userEvent.click(screen.getByText('How to read these counts'))
    expect(
      screen.getByText(/Tablet counts reflect records accessible/),
    ).toBeVisible()
  },
)
