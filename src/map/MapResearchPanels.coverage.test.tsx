import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import MapExportPanel from 'map/MapExportPanel'
import MapMeasurePanel from 'map/MapMeasurePanel'
import MapTerrainPanel from 'map/MapTerrainPanel'
import { toExportRows, type MapExportContext } from 'map/mapExportData'
import type { MeasurementController } from 'map/useMapMeasurement'
import type { MapTerrainResult } from 'map/useMapTerrain'
import { excavationPolygon } from 'test-support/map-fixtures'

const context: MapExportContext = {
  visualization: 'count',
  siteFilter: '',
  shareUrl: 'https://www.ebl.lmu.de/tools/map',
  exportedAt: '2026-11-06T00:00:00.000Z',
  scope: { type: 'selection', polygonId: 'assur-area-a-checksum' },
  dataStatuses: {},
}

it('explains why a selected area cannot yet be exported', () => {
  render(
    <MemoryRouter>
      <MapExportPanel
        rows={[]}
        scope={context.scope}
        buildContext={() => context}
        imageExport={{ isAllowed: false, explanation: 'Source restrictions.' }}
      />
    </MemoryRouter>,
  )
  expect(
    screen.getByText('The selected excavation area is not ready to export.'),
  ).toBeVisible()
  expect(screen.getByRole('button', { name: 'Download CSV' })).toBeDisabled()
})

it.each([1, 2])('describes a viewport export containing %i areas', (count) => {
  const rows = toExportRows(
    Array.from({ length: count }, (_, index) =>
      excavationPolygon({ polygonId: `assur-${index}` }),
    ),
    new Map(),
  )
  render(
    <MemoryRouter>
      <MapExportPanel
        rows={rows}
        scope={{ type: 'viewport', bounds: [[43, 35, 44, 36]] }}
        buildContext={() => context}
        imageExport={{ isAllowed: true, explanation: '' }}
      />
    </MemoryRouter>,
  )
  expect(
    screen.getByText(
      `${count} displayed excavation ${count === 1 ? 'area' : 'areas'} in the current map view will be exported.`,
    ),
  ).toBeVisible()
})

it('switches an area measurement back to distance and metric units', async () => {
  const measurement: MeasurementController = {
    mode: 'area',
    units: 'imperial',
    measurement: {
      mode: 'area',
      vertexCount: 3,
      valueInBaseUnits: 10,
      label: '10 square meters',
    },
    pointCount: 3,
    isAtPointLimit: false,
    setMode: jest.fn(),
    setUnits: jest.fn(),
    addPointAtCenter: jest.fn(),
    removeLastPoint: jest.fn(),
    clear: jest.fn(),
  }
  render(<MapMeasurePanel measurement={measurement} />)
  expect(screen.getByRole('button', { name: 'Area' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  expect(screen.getByRole('button', { name: 'Distance' })).toHaveClass(
    'btn-outline-secondary',
  )
  await userEvent.click(screen.getByRole('button', { name: 'Distance' }))
  await userEvent.click(screen.getByLabelText('Imperial units'))
  expect(measurement.setMode).toHaveBeenCalledWith('distance')
  expect(measurement.setUnits).toHaveBeenCalledWith('metric')
})

it.each([
  ['error', null, 'Elevation terrain is unavailable.'],
  [
    'unavailable',
    'no-approved-source',
    'Elevation is unavailable because no approved terrain source is configured.',
  ],
] as const)(
  'explains terrain status %s without a source',
  (status, reason, text) => {
    const terrain: MapTerrainResult = {
      isSupported: false,
      isEnabled: false,
      source: null,
      exaggeration: 1,
      unavailableReason: reason,
      status,
      errorMessage: null,
    }
    render(<MapTerrainPanel terrain={terrain} onChange={jest.fn()} />)
    expect(screen.getByRole('status')).toHaveTextContent(text)
    expect(screen.getByRole('checkbox')).toBeDisabled()
    expect(
      screen.queryByRole('link', { name: 'Terrain licence and attribution' }),
    ).not.toBeInTheDocument()
  },
)
