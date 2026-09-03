import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { saveAs } from 'file-saver'
import { lastMapMock, resetMapLibreMock } from '__mocks__/maplibre-gl'
import { renderMapTab } from 'test-support/map-render'
import {
  findspotMapData,
  polygonFeature,
  provenanceRecord,
} from 'test-support/map-fixtures'
import { historicalRasterLayerId } from './mapLayers'
import { validatedHistoricalMapOverlays } from './historicalOverlays'

jest.mock('file-saver', () => ({ saveAs: jest.fn() }))

const assur = provenanceRecord({ id: 'assur', longName: 'Aššur' })
const [firstOverlay, secondOverlay] = validatedHistoricalMapOverlays.filter(
  (overlay) => overlay.siteId === 'assur',
)

beforeEach(() => {
  resetMapLibreMock()
  jest.clearAllMocks()
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: () =>
      Promise.resolve({
        type: 'FeatureCollection',
        features: [polygonFeature('assur-area-a-checksum', 'assur')],
      }),
  }) as unknown as typeof fetch
})

async function mountMapTab(): Promise<void> {
  renderMapTab({ provenances: [assur], mapData: [findspotMapData()] })
  await screen.findByLabelText('Findspot map')
  await act(async () => {
    await Promise.resolve()
  })
  act(() => lastMapMock().emit('load'))
}

async function openTool(
  name: string,
  regionName: string = name,
): Promise<HTMLElement> {
  await userEvent.click(await screen.findByRole('button', { name }))
  return screen.getByRole('region', { name: regionName })
}

describe('the publication timeline', () => {
  it('calls the date a publication date, not a chronology', async () => {
    await mountMapTab()
    const panel = await openTool('Timeline')

    expect(
      within(panel).getByText(/not an archaeological chronology/),
    ).toBeInTheDocument()
  })

  it('reports how many maps lack an established publication date', async () => {
    await mountMapTab()
    const panel = await openTool('Timeline')

    expect(within(panel).getByRole('status')).toHaveTextContent(
      /historical maps shown; \d+ without an established publication date\./,
    )
  })

  it('narrows the catalogue by year and resets', async () => {
    await mountMapTab()
    const panel = await openTool('Timeline')
    const status = within(panel).getByRole('status')
    const shown = status.textContent

    await userEvent.type(within(panel).getByLabelText('Published from'), '2000')
    await userEvent.click(
      within(panel).getByLabelText(
        'Include maps without an established publication date',
      ),
    )
    expect(status).not.toHaveTextContent(shown)

    await userEvent.click(
      within(panel).getByRole('button', { name: 'Reset timeline' }),
    )
    expect(status).toHaveTextContent(shown)
  })

  it('persists the timeline in the map link', async () => {
    await mountMapTab()
    const panel = await openTool('Timeline')

    await userEvent.click(
      within(panel).getByLabelText(
        'Include maps without an established publication date',
      ),
    )

    expect(screen.getByTestId('map-location')).toHaveTextContent('yr=%2C%3A0')
  })
})

describe('the comparison tool', () => {
  it('asks for two different layers before comparing', async () => {
    await mountMapTab()
    const panel = await openTool('Compare')

    await userEvent.selectOptions(
      within(panel).getByLabelText('Comparison'),
      'opacity',
    )

    expect(within(panel).getByRole('status')).toHaveTextContent(
      'Choose two different layers to compare.',
    )
  })

  it('cross-fades two overlays onto the single map', async () => {
    await mountMapTab()
    const panel = await openTool('Compare')

    await userEvent.selectOptions(
      within(panel).getByLabelText('Comparison'),
      'opacity',
    )
    await userEvent.selectOptions(
      within(panel).getByLabelText('Left: base map'),
      firstOverlay.id,
    )
    await userEvent.selectOptions(
      within(panel).getByLabelText('Right: base map'),
      secondOverlay.id,
    )

    const map = lastMapMock()
    expect(map.getLayer(historicalRasterLayerId(firstOverlay.id))).toBeDefined()
    expect(
      map.getLayer(historicalRasterLayerId(secondOverlay.id)),
    ).toBeDefined()
  })

  it('solos one side and releases it again', async () => {
    await mountMapTab()
    const panel = await openTool('Compare')

    await userEvent.selectOptions(
      within(panel).getByLabelText('Comparison'),
      'opacity',
    )
    await userEvent.selectOptions(
      within(panel).getByLabelText('Right: base map'),
      secondOverlay.id,
    )

    const soloLeft = within(panel).getByRole('button', { name: 'Solo left' })
    await userEvent.click(soloLeft)
    expect(soloLeft).toHaveAttribute('aria-pressed', 'true')

    await userEvent.click(soloLeft)
    expect(soloLeft).toHaveAttribute('aria-pressed', 'false')
  })

  it('persists the comparison in the map link', async () => {
    await mountMapTab()
    const panel = await openTool('Compare')

    await userEvent.selectOptions(
      within(panel).getByLabelText('Comparison'),
      'opacity',
    )

    expect(screen.getByTestId('map-location')).toHaveTextContent('cmp=opacity')
  })
})

describe('the export tool', () => {
  it('downloads GeoJSON and CSV of the visible areas', async () => {
    await mountMapTab()
    const panel = await openTool('Export')

    expect(
      within(panel).getByText('1 visible excavation areas will be exported.'),
    ).toBeInTheDocument()

    await userEvent.click(
      within(panel).getByRole('button', { name: 'Download GeoJSON' }),
    )
    await userEvent.click(
      within(panel).getByRole('button', { name: 'Download CSV' }),
    )

    expect(saveAs).toHaveBeenCalledTimes(2)
    expect((saveAs as jest.Mock).mock.calls[0][1]).toMatch(/\.geojson$/)
    expect((saveAs as jest.Mock).mock.calls[1][1]).toMatch(/\.csv$/)
  })
})

describe('the measurement tool', () => {
  it('measures an area in the chosen units', async () => {
    await mountMapTab()
    const panel = await openTool('Measure')
    const map = lastMapMock()

    await userEvent.selectOptions(
      within(panel).getByLabelText('Measure'),
      'area',
    )
    await userEvent.selectOptions(
      within(panel).getByLabelText('Units'),
      'imperial',
    )

    act(() => map.emit('click', { lngLat: { lng: 43.25, lat: 35.45 } }))
    act(() => map.emit('click', { lngLat: { lng: 43.2505, lat: 35.45 } }))
    act(() => map.emit('click', { lngLat: { lng: 43.2505, lat: 35.4505 } }))

    expect(
      within(panel).getByText(/sq ft$/, {
        selector: '.map-tool-panel__measurement',
      }),
    ).toBeInTheDocument()
  })
})
