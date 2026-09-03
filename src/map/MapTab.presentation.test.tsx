import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { lastMapMock, resetMapLibreMock } from '__mocks__/maplibre-gl'
import type { MapMock } from '__mocks__/maplibre-gl'
import { createdMapMocks } from '__mocks__/maplibre-gl'
import { MAP_LOCATION_TEST_ID, renderMapTab } from 'test-support/map-render'
import {
  findspotMapData,
  polygonFeature,
  provenanceRecord,
} from 'test-support/map-fixtures'

const assur = provenanceRecord({ id: 'assur', longName: 'Aššur' })
const mapData = [findspotMapData({ polygonIds: ['p1'] })]

beforeEach(() => {
  resetMapLibreMock()
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: () =>
      Promise.resolve({
        type: 'FeatureCollection',
        features: [polygonFeature('p1', 'assur')],
      }),
  }) as unknown as typeof fetch
})

async function mountMapTab(
  initialEntries?: readonly string[],
): Promise<MapMock> {
  renderMapTab({ provenances: [assur], mapData, initialEntries })
  await screen.findByLabelText('Findspot map')
  await act(async () => {
    await Promise.resolve()
  })
  act(() => lastMapMock().emit('load'))
  return lastMapMock()
}

async function enterPresentation(): Promise<void> {
  await userEvent.click(
    await screen.findByRole('button', { name: 'Presentation mode' }),
  )
}

describe('entering presentation mode', () => {
  it('hides the route chrome, the toolbar and the legend', async () => {
    await mountMapTab()

    await enterPresentation()

    expect(
      screen.queryByRole('heading', { name: 'Archaeological atlas' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('group', { name: 'Map tools' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Legend' }),
    ).not.toBeInTheDocument()
    expect(screen.getByLabelText('Findspot map')).toBeInTheDocument()
  })

  it('focuses the exit control so the mode is never a trap', async () => {
    await mountMapTab()

    await enterPresentation()

    expect(
      screen.getByRole('button', { name: 'Exit presentation mode' }),
    ).toHaveFocus()
  })

  it('reuses the one map instance', async () => {
    await mountMapTab()
    const mapsBefore = createdMapMocks().length

    await enterPresentation()

    expect(createdMapMocks().length).toBe(mapsBefore)
    expect(lastMapMock().removed).toBe(false)
  })
})

describe('leaving presentation mode', () => {
  it('restores the chrome through its own control', async () => {
    await mountMapTab()
    await enterPresentation()

    await userEvent.click(
      screen.getByRole('button', { name: 'Exit presentation mode' }),
    )

    expect(
      screen.getByRole('heading', { name: 'Archaeological atlas' }),
    ).toBeInTheDocument()
  })

  it('leaves on Escape without dropping the selection', async () => {
    await mountMapTab(['/?v=1&site=assur'])
    await enterPresentation()

    expect(screen.getByText('Aššur')).toBeInTheDocument()

    await userEvent.keyboard('{Escape}')

    expect(
      screen.getByRole('heading', { name: 'Archaeological atlas' }),
    ).toBeInTheDocument()
    expect(screen.getByTestId(MAP_LOCATION_TEST_ID)).toHaveTextContent(
      'site=assur',
    )
  })

  it('keeps presentation state out of the url', async () => {
    await mountMapTab()

    await enterPresentation()

    expect(screen.getByTestId(MAP_LOCATION_TEST_ID)).not.toHaveTextContent(
      'present',
    )
  })
})
