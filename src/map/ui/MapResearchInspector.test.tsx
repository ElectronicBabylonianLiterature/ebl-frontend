import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import MapResearchInspector from 'map/ui/MapResearchInspector'
import { makeProvenance } from 'map/testFixtures/provenance'
import type { ExcavationPolygon } from 'map/domain/excavationPolygonIndex'
import { buildFragmentSearchLink } from 'map/domain/mapLinks'

function polygon(
  overrides: Partial<ExcavationPolygon> = {},
): ExcavationPolygon {
  return {
    polygonId: 'uruk-area-1',
    siteId: 'uruk',
    name: 'Area 1',
    areaSquareKm: 1,
    bounds: [45, 31, 46, 32],
    geometry: { type: 'Polygon', coordinates: [] },
    ...overrides,
  }
}

it('shows supplied location details and preserves source notes', async () => {
  const onClose = jest.fn()
  render(
    <MemoryRouter>
      <MapResearchInspector
        selectionId="site:uruk"
        provenance={makeProvenance({
          id: 'uruk',
          longName: 'Uruk',
          abbreviation: 'U',
          parent: 'Iraq',
          coordinates: {
            latitude: 31,
            longitude: 45,
            notes: 'Source location unresolved.',
            uncertaintyRadiusKm: 3,
          },
        })}
        onClose={onClose}
      />
    </MemoryRouter>,
  )
  expect(screen.getByRole('heading', { name: 'Uruk' })).toHaveFocus()
  expect(screen.getByText('Site location')).toBeVisible()
  expect(screen.getByText('Source location unresolved.')).toBeVisible()
  expect(screen.getByText('Iraq')).toBeVisible()
  expect(screen.getByText('3 km radius')).toBeVisible()
  expect(
    screen.getByRole('link', { name: 'Search Uruk in the Library' }),
  ).toHaveAttribute('href', buildFragmentSearchLink('Uruk'))
  await userEvent.click(
    screen.getByRole('button', { name: 'Close location details' }),
  )
  expect(onClose).toHaveBeenCalledTimes(1)
})

it('shows excavation details without internal polygon identifiers', () => {
  render(
    <MemoryRouter>
      <MapResearchInspector
        selectionId="area:1"
        polygon={polygon()}
        onClose={jest.fn()}
      />
    </MemoryRouter>,
  )
  expect(screen.getByRole('heading', { name: 'Area 1' })).toBeVisible()
  expect(screen.getByText('Excavation area')).toBeVisible()
  expect(screen.queryByText('Polygon ID')).not.toBeInTheDocument()
  expect(screen.queryByText('uruk-area-1')).not.toBeInTheDocument()
  expect(screen.getByText('uruk')).toBeVisible()
  expect(screen.getByRole('link')).toHaveAttribute(
    'href',
    buildFragmentSearchLink('Uruk'),
  )
  expect(screen.queryByText('Abbreviation')).not.toBeInTheDocument()
})

it('omits unsupported fields and links for an unknown site', () => {
  render(
    <MemoryRouter>
      <MapResearchInspector
        selectionId="area:unknown"
        polygon={polygon({ siteId: 'unknown', name: null })}
        onClose={jest.fn()}
      />
    </MemoryRouter>,
  )
  expect(
    screen.getByRole('heading', { name: 'Location details' }),
  ).toBeVisible()
  expect(screen.queryByRole('link')).not.toBeInTheDocument()
  expect(screen.queryByText('Archaeological site')).not.toBeInTheDocument()
})

it('distinguishes a provenance area without adding unsupported metadata', () => {
  render(
    <MemoryRouter>
      <MapResearchInspector
        selectionId="site:area"
        provenance={makeProvenance({
          longName: 'Site area',
          abbreviation: '',
          parent: null,
          polygonCoordinates: [
            { latitude: 30, longitude: 40 },
            { latitude: 30, longitude: 41 },
            { latitude: 31, longitude: 41 },
          ],
        })}
        onClose={jest.fn()}
      />
    </MemoryRouter>,
  )
  expect(screen.getByText('Mapped area')).toBeVisible()
  expect(screen.queryByText('Parent location')).not.toBeInTheDocument()
  expect(screen.queryByText('Abbreviation')).not.toBeInTheDocument()
})

it('provides an honest unknown-location state and closes only on unhandled Escape', () => {
  const onClose = jest.fn()
  render(
    <MemoryRouter>
      <MapResearchInspector selectionId="unknown" onClose={onClose} />
    </MemoryRouter>,
  )
  const panel = screen.getByRole('region', { name: 'Location details' })
  expect(
    screen.getByText(
      'The selected location is not available in the current site list.',
    ),
  ).toBeVisible()
  fireEvent.keyDown(panel, { key: 'Enter' })
  expect(onClose).not.toHaveBeenCalled()
  panel.addEventListener('keydown', (event) => event.preventDefault(), {
    once: true,
  })
  fireEvent.keyDown(panel, { key: 'Escape' })
  expect(onClose).not.toHaveBeenCalled()
  fireEvent.keyDown(panel, { key: 'Escape' })
  expect(onClose).toHaveBeenCalledTimes(1)
})

it.each([0, -1, Number.NaN])(
  'keeps valid zero uncertainty and omits invalid radius %s',
  (radius) => {
    render(
      <MemoryRouter>
        <MapResearchInspector
          selectionId="uncertainty"
          provenance={makeProvenance({
            coordinates: {
              latitude: 31,
              longitude: 45,
              uncertaintyRadiusKm: radius,
            },
          })}
          onClose={jest.fn()}
        />
      </MemoryRouter>,
    )
    if (radius === 0) expect(screen.getByText('0 km radius')).toBeVisible()
    else
      expect(screen.queryByText('Location uncertainty')).not.toBeInTheDocument()
  },
)
