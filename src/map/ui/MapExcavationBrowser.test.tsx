import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MapExcavationBrowser from 'map/ui/MapExcavationBrowser'
import type { ExcavationPolygon } from 'map/domain/excavationPolygonIndex'

const polygon: ExcavationPolygon = {
  polygonId: 'uruk-area-1',
  siteId: 'uruk',
  name: 'Eanna',
  bounds: null,
  areaSquareKm: null,
  geometry: { type: 'Polygon', coordinates: [] },
}

it('omits the selector when no validated polygon data is available', () => {
  render(
    <MapExcavationBrowser
      polygonIndex={new Map()}
      selectedId={null}
      onSelect={jest.fn()}
    />,
  )
  expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
})

it('offers known site names and passes area identity and the focus trigger', async () => {
  const onSelect = jest.fn()
  const { rerender } = render(
    <MapExcavationBrowser
      polygonIndex={new Map([['uruk', [polygon]]])}
      selectedId={null}
      onSelect={onSelect}
    />,
  )
  const select = screen.getByRole('combobox', {
    name: 'Inspect excavation area',
  })
  expect(screen.getByRole('group', { name: 'Uruk' })).toBeInTheDocument()
  await userEvent.selectOptions(select, 'uruk-area-1')
  expect(onSelect).toHaveBeenCalledWith('uruk-area-1', select)
  rerender(
    <MapExcavationBrowser
      polygonIndex={new Map([['uruk', [polygon]]])}
      selectedId="uruk-area-1"
      onSelect={onSelect}
    />,
  )
  expect(select).toHaveValue('uruk-area-1')
  fireEvent.change(select, { target: { value: '' } })
  expect(onSelect).toHaveBeenCalledTimes(1)
})

it('uses preserved identifiers if a site or area name is unavailable', () => {
  render(
    <MapExcavationBrowser
      polygonIndex={new Map([['unknown', [{ ...polygon, name: null }]]])}
      selectedId={null}
      onSelect={jest.fn()}
    />,
  )
  expect(screen.getByRole('group', { name: 'unknown' })).toBeInTheDocument()
  expect(
    screen.getByRole('option', { name: 'uruk-area-1' }),
  ).toBeInTheDocument()
})
