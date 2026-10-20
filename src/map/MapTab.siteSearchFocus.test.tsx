import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { lastMapMock, resetMapLibreMock } from '__mocks__/maplibre-gl'
import { unclusteredLayer } from 'map/mapLayers'
import { MAP_LOCATION_TEST_ID, renderMapTab } from 'test-support/map-render'
import { provenanceRecord } from 'test-support/map-fixtures'
import { pointFeature } from 'test-support/map-interaction-fixtures'

const assur = provenanceRecord({
  id: 'assur',
  longName: 'Aššur',
  abbreviation: 'Aš',
  coordinates: { latitude: 35.45, longitude: 43.26 },
  polygonCoordinates: [
    { latitude: 35.44, longitude: 43.25 },
    { latitude: 35.44, longitude: 43.27 },
    { latitude: 35.46, longitude: 43.27 },
    { latitude: 35.46, longitude: 43.25 },
  ],
})

beforeEach(() => {
  resetMapLibreMock()
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ type: 'FeatureCollection', features: [] }),
  }) as unknown as typeof fetch
})

async function mountMapTab(initialEntries?: readonly string[]): Promise<void> {
  renderMapTab({
    provenances: [provenanceRecord(), assur],
    initialEntries,
  })
  await screen.findByLabelText('Findspot map')
  await act(async () => undefined)
  act(() => lastMapMock().emit('load'))
}

it('suggests and selects a diacritic site name from an ASCII query', async () => {
  await mountMapTab()

  await userEvent.type(screen.getByLabelText('Site name'), 'assur')
  await userEvent.click(await screen.findByRole('option', { name: 'Aššur' }))

  expect(screen.getByText('1 visible sites')).toBeInTheDocument()
  await waitFor(() =>
    expect(screen.getByTestId(MAP_LOCATION_TEST_ID)).toHaveTextContent(
      'q=A%C5%A1%C5%A1ur',
    ),
  )
})

it('restores a partial search and clears it when the view resets', async () => {
  await mountMapTab(['/?v=1&q=ass'])

  expect(lastMapMock().fitBounds).toHaveBeenCalledWith(expect.any(Array), {
    padding: 40,
    maxZoom: 12,
    animate: false,
  })
  const input = screen.getByLabelText('Site name')
  expect(input).toHaveValue('ass')
  await userEvent.click(input)
  expect(await screen.findByRole('option', { name: 'Aššur' })).toBeVisible()
  await userEvent.keyboard('{Escape}')
  await userEvent.click(screen.getByRole('button', { name: 'Reset view' }))

  expect(input).toHaveValue('')
  expect(screen.getByText('2 visible sites')).toBeInTheDocument()
})

it.each(['marker', 'explorer'])(
  'frames the site polygon when selected from the %s',
  async (source) => {
    await mountMapTab()
    const map = lastMapMock()
    map.fitBounds.mockClear()
    map.easeTo.mockClear()

    if (source === 'marker') {
      map.setRenderedFeatures((layers) =>
        layers.includes(unclusteredLayer.id)
          ? [pointFeature('assur', 'Aššur')]
          : [],
      )
      act(() => map.emit('click', { point: { x: 5, y: 5 } }))
    } else {
      await userEvent.click(screen.getByRole('button', { name: /Aššur/ }))
    }

    expect(await screen.findByRole('heading', { name: 'Aššur' })).toBeVisible()
    expect(map.fitBounds).toHaveBeenCalledWith(
      [
        [43.25, 35.44],
        [43.27, 35.46],
      ],
      {
        padding: 48,
        maxZoom: 16,
      },
    )
    expect(map.easeTo).not.toHaveBeenCalled()
  },
)
