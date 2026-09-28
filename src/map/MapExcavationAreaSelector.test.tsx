import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MapExcavationAreaSelector from 'map/MapExcavationAreaSelector'
import { excavationPolygon } from 'test-support/map-fixtures'

const polygons = [
  excavationPolygon({
    polygonId: 'assur-area-a-checksum',
    name: 'Area A',
  }),
  excavationPolygon({
    polygonId: 'assur-area-b-checksum',
    name: null,
  }),
  excavationPolygon({
    polygonId: 'uruk-pd-xvi-4-first',
    siteId: 'uruk',
    name: 'Pd XVI/4',
  }),
  excavationPolygon({
    polygonId: 'uruk-pd-xvi-4-second',
    siteId: 'uruk',
    name: 'Pd XVI/4',
  }),
]

describe('MapExcavationAreaSelector', () => {
  it('provides a labeled native select with polygon names and ID fallbacks', () => {
    render(
      <MapExcavationAreaSelector
        polygons={polygons}
        selectedPolygonId={null}
        onSelect={jest.fn()}
      />,
    )

    const selector = screen.getByRole('combobox', {
      name: 'Select excavation area',
    })
    expect(selector).toHaveAttribute('id', 'map-excavation-area-selector')
    expect(
      screen.getByText('Excavation area', { selector: 'label' }),
    ).toHaveAttribute('for', selector.id)
    expect(screen.getByRole('option', { name: 'Aššur — Area A' })).toHaveValue(
      'assur-area-a-checksum',
    )
    expect(
      screen.getByRole('option', {
        name: 'Aššur — assur-area-b-checksum',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('option', {
        name: 'Uruk — Pd XVI/4 — uruk-pd-xvi-4-first',
      }),
    ).toHaveValue('uruk-pd-xvi-4-first')
    expect(
      screen.getByRole('option', {
        name: 'Uruk — Pd XVI/4 — uruk-pd-xvi-4-second',
      }),
    ).toHaveValue('uruk-pd-xvi-4-second')
  })

  it('is keyboard reachable and reports selected and cleared values', async () => {
    const onSelect = jest.fn()
    render(
      <MapExcavationAreaSelector
        polygons={polygons}
        selectedPolygonId="assur-area-a-checksum"
        onSelect={onSelect}
      />,
    )
    const selector = screen.getByRole('combobox', {
      name: 'Select excavation area',
    })

    await userEvent.tab()
    expect(selector).toHaveFocus()
    await userEvent.selectOptions(selector, 'assur-area-b-checksum')
    expect(onSelect).toHaveBeenLastCalledWith('assur-area-b-checksum')

    await userEvent.selectOptions(selector, '')
    expect(onSelect).toHaveBeenLastCalledWith(null)
  })
})
