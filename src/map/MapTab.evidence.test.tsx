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
import {
  COLOR_EVIDENCE_CURATED,
  COLOR_EVIDENCE_MIXED,
  COLOR_EVIDENCE_VERIFIED,
  EVIDENCE_CODES,
} from './mapEvidencePaint'
import { EXCAVATION_AREAS_SOURCE_ID } from './mapLayerIds'

const assur = provenanceRecord({ id: 'assur', longName: 'Aššur' })

const mapData = [
  findspotMapData({ findspotId: 1, polygonIds: ['p1'] }),
  findspotMapData({
    findspotId: 2,
    polygonIds: ['p2'],
    matchMethod: 'curated',
  }),
  findspotMapData({ findspotId: 3, polygonIds: ['p3'] }),
  findspotMapData({
    findspotId: 4,
    polygonIds: ['p3'],
    matchMethod: 'curated',
  }),
]

beforeEach(() => {
  resetMapLibreMock()
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: () =>
      Promise.resolve({
        type: 'FeatureCollection',
        features: ['p1', 'p2', 'p3', 'p4'].map((id) =>
          polygonFeature(id, 'assur'),
        ),
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

function fillColorFor(mapMock: MapMock, polygonId: string): unknown {
  const paint = mapMock.getLayer(EXCAVATION_AREA_FILL_LAYER_ID) as
    | Record<string, unknown>
    | undefined

  return evaluateExpression(paint?.['fill-color'], {
    featureState: mapMock.getFeatureState({
      source: EXCAVATION_AREAS_SOURCE_ID,
      id: polygonId,
    }),
  })
}

describe('evidence visualization', () => {
  it('classes each polygon by the evidence behind its mapping', async () => {
    const mapMock = await mountMapTab(['/?v=1&viz=evidence'])

    expect(fillColorFor(mapMock, 'p1')).toBe(COLOR_EVIDENCE_VERIFIED)
    expect(fillColorFor(mapMock, 'p2')).toBe(COLOR_EVIDENCE_CURATED)
    expect(fillColorFor(mapMock, 'p3')).toBe(COLOR_EVIDENCE_MIXED)
  })

  it('writes the evidence code as feature state, not as source data', async () => {
    const mapMock = await mountMapTab(['/?v=1&viz=evidence'])

    expect(
      mapMock.getFeatureState({
        source: EXCAVATION_AREAS_SOURCE_ID,
        id: 'p2',
      }),
    ).toMatchObject({ evidenceCode: EVIDENCE_CODES.curated })
    expect(
      mapMock.getFeatureState({
        source: EXCAVATION_AREAS_SOURCE_ID,
        id: 'p4',
      }),
    ).toEqual({})
  })

  it('repaints in place and records the mode in the url', async () => {
    const mapMock = await mountMapTab()
    const sourcesBefore = [...mapMock.sources.keys()]
    const requestsBefore = (global.fetch as jest.Mock).mock.calls.length

    await userEvent.click(
      await screen.findByRole('button', { name: 'Visualize' }),
    )
    await userEvent.selectOptions(
      within(screen.getByRole('region', { name: 'Visualize' })).getByLabelText(
        'Visualize',
      ),
      'evidence',
    )

    expect([...mapMock.sources.keys()]).toEqual(sourcesBefore)
    expect((global.fetch as jest.Mock).mock.calls.length).toBe(requestsBefore)
    expect(screen.getByTestId(MAP_LOCATION_TEST_ID)).toHaveTextContent(
      'viz=evidence',
    )
  })

  it('names the evidence classes in the on-map legend', async () => {
    await mountMapTab(['/?v=1&viz=evidence'])

    await userEvent.click(screen.getByRole('button', { name: 'Legend' }))

    const legend = screen.getByLabelText('Map legend')
    expect(legend).toHaveTextContent('Verified-source mapping')
    expect(legend).toHaveTextContent('Curated mapping')
    expect(legend).toHaveTextContent('Mixed mapping evidence')
  })
})
