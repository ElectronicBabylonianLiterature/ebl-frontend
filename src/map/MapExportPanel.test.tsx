import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MapExportPanel from 'map/MapExportPanel'
import type { MapExportContext, MapExportRow } from 'map/mapExportData'
import { downloadExportCsv, downloadExportGeoJson } from 'map/mapExportDownload'

jest.mock(
  'map/MapShareLink',
  () =>
    function MockMapShareLink() {
      return <div>Share control</div>
    },
)
jest.mock('map/mapExportDownload', () => ({
  downloadExportCsv: jest.fn(),
  downloadExportGeoJson: jest.fn(),
}))

const ROW: MapExportRow = {
  siteId: 'assur',
  polygonId: 'assur-a',
  label: 'Area A',
  geometry: {
    type: 'Polygon',
    coordinates: [
      [
        [43, 35],
        [44, 35],
        [44, 36],
        [43, 35],
      ],
    ],
  },
  dataStatus: 'loaded-empty',
  mappedFindspotIds: [],
  mappedFindspotCount: 0,
  accessibleFragmentCount: 0,
  areaSquareKm: 0.8,
  locationPrecision: 'not-mapped',
  matchMethod: 'not-mapped',
}

const CONTEXT: MapExportContext = {
  visualization: 'count',
  siteFilter: '',
  shareUrl: 'https://www.ebl.lmu.de/map?v=1',
  exportedAt: '2026-08-05T12:00:00.000Z',
  scope: { type: 'selection', polygonId: ROW.polygonId },
  dataStatuses: { assur: 'loaded-empty' },
}

const IMAGE_BLOCKED = {
  isAllowed: false as const,
  explanation: 'The active basemap does not grant redistribution rights.',
}

describe('MapExportPanel', () => {
  beforeEach(jest.clearAllMocks)

  it('describes an empty viewport and disables data downloads', () => {
    render(
      <MapExportPanel
        rows={[]}
        scope={{ type: 'viewport', bounds: [[43, 35, 44, 36]] }}
        buildContext={() => CONTEXT}
        imageExport={IMAGE_BLOCKED}
      />,
    )

    expect(screen.getByRole('status')).toHaveTextContent(
      'No displayed excavation areas are in the current map view.',
    )
    expect(
      screen.getByRole('button', { name: 'Download GeoJSON' }),
    ).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Download CSV' })).toBeDisabled()
    expect(
      screen.getByText(/does not grant redistribution rights/),
    ).toBeVisible()
  })

  it('builds fresh snapshot context for each selected-area download', async () => {
    const buildContext = jest.fn(() => CONTEXT)
    render(
      <MapExportPanel
        rows={[ROW]}
        scope={CONTEXT.scope}
        buildContext={buildContext}
        imageExport={IMAGE_BLOCKED}
      />,
    )

    expect(screen.getByRole('status')).toHaveTextContent(
      'The selected excavation area will be exported.',
    )
    await userEvent.click(
      screen.getByRole('button', { name: 'Download GeoJSON' }),
    )
    await userEvent.click(screen.getByRole('button', { name: 'Download CSV' }))

    expect(buildContext).toHaveBeenCalledTimes(2)
    expect(downloadExportGeoJson).toHaveBeenCalledWith([ROW], CONTEXT)
    expect(downloadExportCsv).toHaveBeenCalledWith([ROW], CONTEXT)
  })

  it('states unavailable-linked-data and caller-access caveats', () => {
    render(
      <MapExportPanel
        rows={[ROW]}
        scope={CONTEXT.scope}
        buildContext={() => CONTEXT}
        imageExport={{ isAllowed: true, explanation: '' }}
      />,
    )

    expect(
      screen.getByText(/fields are blank when site data is unavailable/),
    ).toBeVisible()
    expect(screen.getByText(/caller-authorized snapshots/)).toBeVisible()
    expect(
      screen.queryByText(/Image export is unavailable/),
    ).not.toBeInTheDocument()
  })
})
