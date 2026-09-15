import type { FeatureCollection } from 'geojson'
import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
  deferMapLoad,
  makeFragmentService,
  makeProvenance,
  mockAddSource,
  mockFitBounds,
  mockGetSource,
  mockSetData,
  renderMapTab,
  resetMapMocks,
  triggerMapEvent,
} from 'map/ui/MapTab.testSupport'

jest.mock('maplibre-gl')

describe('MapTab filtering', () => {
  beforeEach(resetMapMocks)

  it('filters provenances case-insensitively', async () => {
    const provenances = [
      makeProvenance({ id: 'babylon', longName: 'Babylon' }),
      makeProvenance({ id: 'nippur', longName: 'Nippur' }),
      makeProvenance({ id: 'uruk', longName: 'Uruk' }),
    ]
    mockGetSource.mockReturnValue({ setData: mockSetData })

    renderMapTab(makeFragmentService(provenances))

    const input = await screen.findByLabelText('Filter findspots by name')
    await userEvent.type(input, 'bab')

    await waitFor(() => {
      expect(mockSetData).toHaveBeenCalled()
    })
    const setDataCall = mockSetData.mock.calls[
      mockSetData.mock.calls.length - 1
    ][0] as FeatureCollection
    expect(setDataCall.features).toHaveLength(1)
    expect(setDataCall.features[0].properties?.name).toBe('Babylon')
  })

  it('filters diacritic sites when the plain-ASCII form is typed', async () => {
    const provenances = [
      makeProvenance({ id: 'assur', longName: 'Aššur' }),
      makeProvenance({ id: 'babylon', longName: 'Babylon' }),
    ]
    mockGetSource.mockReturnValue({ setData: mockSetData })

    renderMapTab(makeFragmentService(provenances))

    const input = await screen.findByLabelText('Filter findspots by name')
    await userEvent.type(input, 'assur')

    await waitFor(() => {
      expect(mockSetData).toHaveBeenCalled()
    })
    const setDataCall = mockSetData.mock.calls[
      mockSetData.mock.calls.length - 1
    ][0] as FeatureCollection
    expect(setDataCall.features).toHaveLength(1)
    expect(setDataCall.features[0].properties?.name).toBe('Aššur')
  })

  it('re-fits the camera to the filtered findspots on filter change', async () => {
    const provenances = [
      makeProvenance({ id: 'babylon', longName: 'Babylon' }),
      makeProvenance({ id: 'nippur', longName: 'Nippur' }),
    ]
    mockGetSource.mockReturnValue({ setData: mockSetData })

    renderMapTab(makeFragmentService(provenances))

    const input = await screen.findByLabelText('Filter findspots by name')
    await waitFor(() => expect(mockFitBounds).toHaveBeenCalled())
    const fitCallsBeforeFilter = mockFitBounds.mock.calls.length

    await userEvent.type(input, 'bab')

    await waitFor(() => {
      expect(mockSetData).toHaveBeenCalled()
    })
    await waitFor(() =>
      expect(mockFitBounds.mock.calls.length).toBeGreaterThan(
        fitCallsBeforeFilter,
      ),
    )
  })

  it('coalesces rapid filter changes into a single camera fit', async () => {
    const provenances = [
      makeProvenance({ id: 'babylon', longName: 'Babylon' }),
      makeProvenance({ id: 'nippur', longName: 'Nippur' }),
    ]
    mockGetSource.mockReturnValue({ setData: mockSetData })

    renderMapTab(makeFragmentService(provenances))
    const input = await screen.findByLabelText('Filter findspots by name')
    await waitFor(() => expect(mockSetData).toHaveBeenCalled())
    mockFitBounds.mockClear()

    await userEvent.type(input, 'nippur')
    await waitFor(() => expect(mockFitBounds).toHaveBeenCalled())

    expect(mockFitBounds).toHaveBeenCalledTimes(1)
    expect(mockSetData.mock.calls.length).toBeGreaterThan(1)
  })

  it('uses the active filter when the style loads after filtering', async () => {
    const provenances = [
      makeProvenance({ id: 'babylon', longName: 'Babylon' }),
      makeProvenance({ id: 'nippur', longName: 'Nippur' }),
    ]
    deferMapLoad()

    renderMapTab(makeFragmentService(provenances))

    const input = await screen.findByLabelText('Filter findspots by name')
    await userEvent.type(input, 'bab')
    expect(mockAddSource).not.toHaveBeenCalled()

    act(() => {
      triggerMapEvent('load')
    })

    expect(mockAddSource).toHaveBeenCalledTimes(1)
    const source = mockAddSource.mock.calls[0][1]
    expect(source.data.features).toHaveLength(1)
    expect(source.data.features[0].properties.name).toBe('Babylon')
  })

  it('updates the source in place once it has been added to the map', async () => {
    const provenances = [
      makeProvenance({ id: 'babylon', longName: 'Babylon' }),
      makeProvenance({ id: 'nippur', longName: 'Nippur' }),
    ]
    mockGetSource.mockReturnValue({ setData: mockSetData })

    renderMapTab(makeFragmentService(provenances))
    const input = await screen.findByLabelText('Filter findspots by name')
    await waitFor(() => expect(mockAddSource).toHaveBeenCalled())

    await userEvent.type(input, 'nip')

    await waitFor(() => expect(mockSetData).toHaveBeenCalled())
    const lastData = mockSetData.mock.calls[
      mockSetData.mock.calls.length - 1
    ][0] as FeatureCollection
    expect(lastData.features).toHaveLength(1)
    expect(lastData.features[0].properties?.name).toBe('Nippur')
  })

  it('does not update a source that has not been added yet', async () => {
    deferMapLoad()
    mockGetSource.mockReturnValue(undefined)

    renderMapTab(
      makeFragmentService([
        makeProvenance({ id: 'babylon', longName: 'Babylon' }),
      ]),
    )
    const input = await screen.findByLabelText('Filter findspots by name')
    await userEvent.type(input, 'bab')

    expect(mockSetData).not.toHaveBeenCalled()
  })
})
