import { act, fireEvent, screen } from '@testing-library/react'
import fetchMock from 'jest-fetch-mock'
import fs from 'fs'
import path from 'path'
import {
  deferMapLoad,
  makeFragmentService,
  makeProvenance,
  mockAddSource,
  mockCaptureException,
  mockEaseTo,
  mockFitBounds,
  mockGetClusterExpansionZoom,
  mockGetSource,
  mockQueryRenderedFeatures,
  renderMapTab,
  resetMapMocks,
  triggerMapEvent,
} from 'map/ui/MapTab.testSupport'
import { MAP_STYLE_LOAD_EVENT } from 'map/maplibre/mapLayers'
import { INITIAL_CENTER, INITIAL_ZOOM } from 'map/maplibre/mapCamera'

jest.mock('maplibre-gl')

const ASSET = fs.readFileSync(
  path.resolve(__dirname, '../../../public/map-data/findspots/all.geojson'),
  'utf8',
)
const AREA_ID = JSON.parse(ASSET).features[0].properties.id
const CLUSTER_ID_PROPERTY = 'cluster_id'
const ACTIONS = ['Inspect site', 'Inspect area', 'Reset'] as const
type Action = (typeof ACTIONS)[number]

function takeCameraAction(action: Action): void {
  if (action === 'Inspect site') {
    fireEvent.click(screen.getByRole('button', { name: 'Inspect Babylon' }))
    expect(mockEaseTo).toHaveBeenLastCalledWith(
      expect.objectContaining({ zoom: 14 }),
    )
  } else if (action === 'Inspect area') {
    fireEvent.change(
      screen.getByRole('combobox', { name: 'Inspect excavation area' }),
      {
        target: { value: AREA_ID },
      },
    )
    expect(mockFitBounds).toHaveBeenLastCalledWith(expect.any(Array), {
      padding: 40,
      maxZoom: 17,
    })
  } else {
    fireEvent.click(screen.getByRole('button', { name: 'Reset view' }))
    expect(mockEaseTo).toHaveBeenLastCalledWith({
      center: INITIAL_CENTER,
      zoom: INITIAL_ZOOM,
      bearing: 0,
      pitch: 0,
    })
  }
  mockEaseTo.mockClear()
  mockFitBounds.mockClear()
}

async function renderLoadedControls(): Promise<void> {
  renderMapTab(makeFragmentService([makeProvenance()]))
  await screen.findByRole('button', { name: 'Inspect Babylon' })
  await screen.findByRole('combobox', { name: 'Inspect excavation area' })
}

function deferClusterExpansion() {
  let resolveCluster: (zoom: number) => void = () => undefined
  let rejectCluster: (error: Error) => void = () => undefined
  mockGetClusterExpansionZoom.mockReturnValueOnce(
    new Promise<number>((resolve, reject) => {
      resolveCluster = resolve
      rejectCluster = reject
    }),
  )
  mockGetSource.mockReturnValue({
    getClusterExpansionZoom: mockGetClusterExpansionZoom,
    setData: jest.fn(),
  })
  mockQueryRenderedFeatures.mockReturnValueOnce([
    {
      properties: { [CLUSTER_ID_PROPERTY]: 1 },
      geometry: { type: 'Point', coordinates: [44, 33] },
    },
  ])
  act(() => triggerMapEvent('click', { point: { x: 10, y: 20 } }))
  expect(mockGetClusterExpansionZoom).toHaveBeenCalledWith(1)
  return { resolveCluster, rejectCluster }
}

beforeEach(() => {
  resetMapMocks()
  fetchMock.resetMocks()
  fetchMock.mockResponseOnce(ASSET)
})
afterEach(() => jest.useRealTimers())

it.each(ACTIONS)(
  'preserves %s when the basemap loads late or reloads',
  async (action) => {
    deferMapLoad()
    await renderLoadedControls()
    takeCameraAction(action)
    act(() => triggerMapEvent(MAP_STYLE_LOAD_EVENT))
    act(() => triggerMapEvent(MAP_STYLE_LOAD_EVENT))
    expect(mockAddSource).toHaveBeenCalled()
    expect(mockFitBounds).not.toHaveBeenCalled()
    expect(mockEaseTo).not.toHaveBeenCalled()
  },
)

describe.each(['resolve', 'reject'] as const)('late cluster %s', (outcome) => {
  it.each(ACTIONS)('preserves the newer %s action', async (action) => {
    await renderLoadedControls()
    const { resolveCluster, rejectCluster } = deferClusterExpansion()
    takeCameraAction(action)
    await act(async () => {
      if (outcome === 'resolve') resolveCluster(12)
      else rejectCluster(new Error('stale cluster failure'))
    })
    expect(mockFitBounds).not.toHaveBeenCalled()
    expect(mockEaseTo).not.toHaveBeenCalled()
    expect(mockCaptureException).not.toHaveBeenCalled()
  })

  it('keeps an old cluster inactive after filtering and clearing search', async () => {
    await renderLoadedControls()
    jest.useFakeTimers()
    const { resolveCluster, rejectCluster } = deferClusterExpansion()
    const search = screen.getByLabelText('Search sites')
    fireEvent.change(search, { target: { value: 'Bab' } })
    act(() => jest.advanceTimersByTime(250))
    mockFitBounds.mockClear()

    fireEvent.change(search, { target: { value: '' } })
    act(() => jest.advanceTimersByTime(250))
    expect(mockFitBounds).toHaveBeenCalledTimes(1)
    mockFitBounds.mockClear()
    mockEaseTo.mockClear()
    await act(async () => {
      if (outcome === 'resolve') resolveCluster(12)
      else rejectCluster(new Error('stale cluster failure'))
    })

    expect(mockFitBounds).not.toHaveBeenCalled()
    expect(mockEaseTo).not.toHaveBeenCalled()
    expect(mockCaptureException).not.toHaveBeenCalled()
  })
})

it.each(ACTIONS)(
  'fits all sites again after %s, filtering and clearing search',
  async (action) => {
    await renderLoadedControls()
    jest.useFakeTimers()
    mockGetSource.mockReturnValue({ setData: jest.fn() })
    takeCameraAction(action)
    const search = screen.getByLabelText('Search sites')
    fireEvent.change(search, { target: { value: 'Bab' } })
    act(() => jest.advanceTimersByTime(250))
    expect(mockFitBounds).toHaveBeenCalledTimes(1)
    mockFitBounds.mockClear()

    fireEvent.change(search, { target: { value: '' } })
    act(() => jest.advanceTimersByTime(250))

    expect(mockFitBounds).toHaveBeenCalledTimes(1)
  },
)

it.each(ACTIONS)(
  'preserves %s when a debounced filter fit finishes later',
  async (action) => {
    await renderLoadedControls()
    jest.useFakeTimers()
    mockGetSource.mockReturnValue({ setData: jest.fn() })
    fireEvent.change(screen.getByLabelText('Search sites'), {
      target: { value: 'Bab' },
    })
    takeCameraAction(action)
    act(() => jest.advanceTimersByTime(250))
    expect(mockFitBounds).not.toHaveBeenCalled()
    expect(mockEaseTo).not.toHaveBeenCalled()
  },
)
