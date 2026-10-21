import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { lastMapMock, resetMapLibreMock } from '__mocks__/maplibre-gl'
import { renderMapTab, MAP_LOCATION_TEST_ID } from 'test-support/map-render'
import { provenanceRecord } from 'test-support/map-fixtures'
import { TERRAIN_SOURCE_ID } from 'map/mapTerrainLayers'

beforeEach(() => {
  resetMapLibreMock()
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ type: 'FeatureCollection', features: [] }),
  }) as unknown as typeof fetch
})

it('applies URL terrain after provenance loading and disables it while sources load', async () => {
  renderMapTab({
    provenances: [provenanceRecord()],
    initialEntries: ['/tools/map?v=1&t=1'],
  })
  expect(screen.getByText('Loading map data...')).toBeInTheDocument()
  await screen.findByLabelText('Findspot map')
  await act(async () => {
    await Promise.resolve()
  })
  const map = lastMapMock()
  await waitFor(() =>
    expect(map.terrain).toEqual({
      source: TERRAIN_SOURCE_ID,
      exaggeration: 1.4,
    }),
  )
  await userEvent.click(screen.getByRole('button', { name: 'Terrain' }))
  const toggle = screen.getByRole('checkbox', {
    name: 'Modern elevation model',
  })
  expect(toggle).toBeChecked()
  map.setStyleLoaded(false)

  await userEvent.click(toggle)

  await waitFor(() => expect(toggle).not.toBeChecked())
  expect(map.terrain).toBeNull()
  expect(screen.getByTestId(MAP_LOCATION_TEST_ID)).not.toHaveTextContent('t=1')
})
