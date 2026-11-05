import { act, screen } from '@testing-library/react'
import {
  makeFragmentService,
  makeProvenance,
  mockAddSource,
  mockCaptureException,
  mockGetCanvas,
  mockGetClusterExpansionZoom,
  mockGetSource,
  mockOn,
  mockQueryRenderedFeatures,
  mockEaseTo,
  renderMapTab,
  resetMapMocks,
  triggerMapEvent,
} from 'map/MapTab.testSupport'

jest.mock('maplibre-gl')

beforeEach(resetMapMocks)

const clusterIdProperty = 'cluster_id'

it('ignores every map callback captured before its owner unmounts', async () => {
  const { unmount } = renderMapTab(makeFragmentService([makeProvenance()]))
  await screen.findByLabelText('Filter findspots by name')
  const callbacks = mockOn.mock.calls.map(([, callbackOrLayer, callback]) =>
    typeof callbackOrLayer === 'function' ? callbackOrLayer : callback,
  )
  unmount()
  jest.clearAllMocks()

  act(() =>
    callbacks.forEach((callback) =>
      callback({
        point: { x: 10, y: 20 },
        error: new Error('late map error'),
      }),
    ),
  )

  expect(mockAddSource).not.toHaveBeenCalled()
  expect(mockGetSource).not.toHaveBeenCalled()
  expect(mockGetCanvas).not.toHaveBeenCalled()
  expect(mockQueryRenderedFeatures).not.toHaveBeenCalled()
  expect(mockCaptureException).not.toHaveBeenCalled()
})

it('ignores a cluster expansion rejection after its owner unmounts', async () => {
  const { unmount } = renderMapTab(makeFragmentService([makeProvenance()]))
  await screen.findByLabelText('Filter findspots by name')
  let rejectExpansion: (error: Error) => void = () => undefined
  mockGetClusterExpansionZoom.mockReturnValue(
    new Promise((_resolve, reject) => {
      rejectExpansion = reject
    }),
  )
  mockGetSource.mockReturnValue({
    getClusterExpansionZoom: mockGetClusterExpansionZoom,
  })
  mockQueryRenderedFeatures.mockReturnValue([
    {
      type: 'Feature',
      properties: { [clusterIdProperty]: 42 },
      geometry: { type: 'Point', coordinates: [44, 33] },
    },
  ])
  act(() => triggerMapEvent('click', { point: { x: 10, y: 20 } }))
  unmount()
  jest.clearAllMocks()

  await act(async () => rejectExpansion(new Error('late cluster failure')))

  expect(mockCaptureException).not.toHaveBeenCalled()
  expect(mockEaseTo).not.toHaveBeenCalled()
})

it('reports an active cluster expansion failure and falls back to its center', async () => {
  renderMapTab(makeFragmentService([makeProvenance()]))
  await screen.findByLabelText('Filter findspots by name')
  const error = new Error('cluster lookup failed')
  mockGetClusterExpansionZoom.mockRejectedValue(error)
  mockGetSource.mockReturnValue({
    getClusterExpansionZoom: mockGetClusterExpansionZoom,
  })
  mockQueryRenderedFeatures.mockReturnValue([
    {
      type: 'Feature',
      properties: { [clusterIdProperty]: 42 },
      geometry: { type: 'Point', coordinates: [44, 33] },
    },
  ])

  await act(async () => triggerMapEvent('click', { point: { x: 10, y: 20 } }))

  expect(mockCaptureException).toHaveBeenCalledWith(error)
  expect(mockEaseTo).toHaveBeenCalledWith({ center: [44, 33] })
})
