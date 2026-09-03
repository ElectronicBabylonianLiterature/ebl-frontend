import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { lastMapMock, resetMapLibreMock } from '__mocks__/maplibre-gl'
import type { MapMock } from '__mocks__/maplibre-gl'
import { MAP_LOCATION_TEST_ID, renderMapTab } from 'test-support/map-render'
import {
  findspotMapData,
  polygonFeature,
  provenanceRecord,
} from 'test-support/map-fixtures'
import { evaluateExpression } from 'test-support/mapExpressionEvaluator'
import { EXCAVATION_AREA_FILL_LAYER_ID } from './mapLayerIds'
import { COLOR_MAPPED_ZERO, SEQUENTIAL_COLORS } from './mapPaintExpressions'

const assur = provenanceRecord({ id: 'assur', longName: 'Aššur' })

const mapData = [
  findspotMapData({
    findspotId: 1,
    polygonIds: ['p1'],
    accessibleFragmentCount: 1,
  }),
  findspotMapData({
    findspotId: 2,
    polygonIds: ['p2'],
    accessibleFragmentCount: 9,
  }),
  findspotMapData({
    findspotId: 3,
    polygonIds: ['p3'],
    accessibleFragmentCount: 90,
  }),
]

beforeEach(() => {
  resetMapLibreMock()
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: () =>
      Promise.resolve({
        type: 'FeatureCollection',
        features: [
          polygonFeature('p1', 'assur'),
          polygonFeature('p2', 'assur'),
          polygonFeature('p3', 'assur'),
        ],
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
  await userEvent.click(
    await screen.findByRole('button', { name: 'Visualize' }),
  )
  return lastMapMock()
}

function visualizationSelect(): HTMLElement {
  return within(
    screen.getByRole('region', { name: 'Visualize' }),
  ).getByLabelText('Visualize')
}

function fillColorFor(
  mapMock: MapMock,
  featureState: Record<string, unknown>,
): unknown {
  const paint = mapMock.getLayer(EXCAVATION_AREA_FILL_LAYER_ID) as
    | Record<string, unknown>
    | undefined

  return evaluateExpression(paint?.['fill-color'], { featureState })
}

describe('visualization control', () => {
  it('offers density only when a geodesic area yields one', async () => {
    await mountMapTab()

    const options = screen
      .getAllByRole('option')
      .map((option) => option.textContent)

    expect(options).toContain('Mapped status')
    expect(options).toContain('Mapping evidence')
    expect(options).toContain('Accessible fragments')
    expect(options).toContain('Fragments per km²')
  })

  it('starts in categorical mapped-status mode', async () => {
    await mountMapTab()

    expect(visualizationSelect()).toHaveValue('mapped')
    expect(screen.getByText('No mapped findspot')).toBeInTheDocument()
    expect(
      screen.getByText('Mapped with accessible fragments'),
    ).toBeInTheDocument()
  })

  it('shows the explicit density unit and its caveat', async () => {
    await mountMapTab(['/?v=1&viz=density'])

    expect(
      screen.getByText('Accessible fragments per square kilometre'),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/not the density of exact findspot points/),
    ).toBeInTheDocument()
  })
})

describe('layer repainting', () => {
  it('classes polygons by accessible count in count mode', async () => {
    const mapMock = await mountMapTab(['/?v=1&viz=count'])

    const lowest = fillColorFor(mapMock, {
      findspotCount: 1,
      accessibleFragmentCount: 1,
    })
    const highest = fillColorFor(mapMock, {
      findspotCount: 1,
      accessibleFragmentCount: 90,
    })

    expect(SEQUENTIAL_COLORS).toContain(lowest)
    expect(SEQUENTIAL_COLORS).toContain(highest)
    expect(lowest).not.toBe(highest)
  })

  it('keeps mapped-but-zero polygons out of the ramp', async () => {
    const mapMock = await mountMapTab(['/?v=1&viz=count'])

    expect(
      fillColorFor(mapMock, {
        findspotCount: 2,
        accessibleFragmentCount: 0,
      }),
    ).toBe(COLOR_MAPPED_ZERO)
  })

  it('repaints without recreating sources when the mode changes', async () => {
    const mapMock = await mountMapTab()
    const sourcesBefore = [...mapMock.sources.keys()]

    await userEvent.selectOptions(visualizationSelect(), 'count')

    expect([...mapMock.sources.keys()]).toEqual(sourcesBefore)
    expect(mapMock.setPaintProperty).toHaveBeenCalledWith(
      EXCAVATION_AREA_FILL_LAYER_ID,
      'fill-color',
      expect.anything(),
    )
  })
})

describe('url persistence', () => {
  it('records a non-default mode', async () => {
    await mountMapTab()

    await userEvent.selectOptions(visualizationSelect(), 'log')

    expect(screen.getByTestId(MAP_LOCATION_TEST_ID)).toHaveTextContent(
      'viz=log',
    )
  })

  it('omits the default mode from the url', async () => {
    await mountMapTab()

    expect(screen.getByTestId(MAP_LOCATION_TEST_ID)).not.toHaveTextContent(
      'viz=',
    )
  })

  it('restores a mode from the url', async () => {
    await mountMapTab(['/?v=1&viz=log'])

    expect(visualizationSelect()).toHaveValue('log')
  })

  it('falls back to mapped status for an unknown mode', async () => {
    await mountMapTab(['/?v=1&viz=heatmap'])

    expect(visualizationSelect()).toHaveValue('mapped')
  })
})
