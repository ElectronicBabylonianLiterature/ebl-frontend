import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import MapInspector from 'map/ui/MapInspector'
import { aggregateFindspotMapData } from 'fragmentarium/domain/findspotMapDataSanitizer'
import {
  excavationPolygon,
  findspotMapDataDto,
} from 'test-support/map-fixtures'

const originalClipboard = Object.getOwnPropertyDescriptor(
  navigator,
  'clipboard',
)

afterEach(() => {
  if (originalClipboard) {
    Object.defineProperty(navigator, 'clipboard', originalClipboard)
  } else {
    Reflect.deleteProperty(navigator, 'clipboard')
  }
})

it('copies the displayed selection and active research context without inventing an area', async () => {
  const writeText = jest.fn().mockResolvedValue(undefined)
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  })
  const polygon = excavationPolygon({ areaSquareKm: null })
  const summary = aggregateFindspotMapData([findspotMapDataDto()]).get(
    polygon.polygonId,
  )
  render(
    <MemoryRouter>
      <MapInspector
        polygon={polygon}
        summary={summary}
        siteName="Assur"
        status="loaded-with-mappings"
        visualizationMode="count"
        siteFilter="Assur"
        onClear={jest.fn()}
      />
    </MemoryRouter>,
  )

  expect(screen.queryByText('Mapped area')).not.toBeInTheDocument()
  await userEvent.click(
    screen.getByRole('button', { name: 'Copy research summary' }),
  )
  expect(
    await screen.findByText('Research summary copied to clipboard.'),
  ).toBeInTheDocument()
  expect(writeText).toHaveBeenCalledWith(
    expect.stringContaining(`Polygon ID: ${polygon.polygonId}`),
  )
  const markdown: string = writeText.mock.calls[0][0]
  expect(markdown).toContain('Accessible tablets: 2')
  expect(markdown).toContain('Accessible tablets\n')
  expect(markdown).toContain('Site name contains "Assur"')
  expect(markdown).toContain(window.location.href)
  expect(markdown).toMatch(/Generated: \d{4}-\d{2}-\d{2}T/)
  expect(markdown).not.toContain('Mapped area:')
})
