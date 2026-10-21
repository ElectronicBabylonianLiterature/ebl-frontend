import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { saveAs } from 'file-saver'
import MapExportPanel from 'map/MapExportPanel'
import {
  type MapExportContext,
  exportDataStatuses,
  toExportRows,
} from 'map/mapExportData'
import type { FragmentMapDataState } from 'map/useFragmentMapData'
import { excavationPolygon } from 'test-support/map-fixtures'

jest.mock('file-saver', () => ({ saveAs: jest.fn() }))

beforeEach(jest.clearAllMocks)

async function downloadedText(): Promise<string> {
  const [blob] = (saveAs as jest.Mock).mock.calls[0] as [Blob]
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsText(blob)
  })
}

it.each(['loading', 'error', 'not-configured', 'loaded-empty'] as const)(
  'downloads truthful linked-data values when the site is %s',
  async (status) => {
    const polygon = excavationPolygon({ areaSquareKm: null })
    const sites: FragmentMapDataState['sites'] = new Map([
      ['assur', { status, findspots: [], polygonSummaries: new Map() }],
    ])
    const context: MapExportContext = {
      visualization: 'mapped',
      siteFilter: '',
      shareUrl: 'https://www.ebl.lmu.de/tools/map',
      exportedAt: '2026-10-21T12:00:00.000Z',
      scope: { type: 'selection', polygonId: polygon.polygonId },
      dataStatuses: exportDataStatuses(sites),
    }
    render(
      <MemoryRouter>
        <MapExportPanel
          rows={toExportRows([polygon], sites)}
          scope={context.scope}
          buildContext={() => context}
          imageExport={{ isAllowed: false, explanation: '' }}
        />
      </MemoryRouter>,
    )

    expect(
      screen.getByText(/fields are blank when site data is unavailable/),
    ).toBeVisible()
    await userEvent.click(
      screen.getByRole('button', { name: 'Download GeoJSON' }),
    )
    const collection = JSON.parse(await downloadedText())
    const count = status === 'loaded-empty' ? 0 : null
    expect(collection.features[0]).toMatchObject({
      geometry: polygon.geometry,
      properties: {
        dataStatus: status,
        mappedFindspotCount: count,
        accessibleFragmentCount: count,
      },
    })
    expect(collection.metadata.dataStatuses).toEqual({ assur: status })
    expect(collection.metadata.accessNote).toContain(
      'blank linked-data fields mean that site data was unavailable',
    )
    ;(saveAs as jest.Mock).mockClear()
    await userEvent.click(screen.getByRole('button', { name: 'Download CSV' }))
    const values = (await downloadedText()).split('\r\n')[1].split(',')
    expect(values[3]).toBe(status)
    expect(values.slice(5, 7)).toEqual(
      status === 'loaded-empty' ? ['0', '0'] : ['', ''],
    )
  },
)
