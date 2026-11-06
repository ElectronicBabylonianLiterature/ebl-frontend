import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MAX_FILTER_LENGTH, parseMapUrlState } from 'map/mapUrlState'
import { INITIAL_CENTER, INITIAL_ZOOM } from 'map/mapCamera'

import {
  CURRENT_LOCATION_TEST_ID,
  makeFragmentService,
  makeProvenance,
  mockEaseTo,
  renderMapTab,
  resetMapMocks,
} from 'map/MapTab.testSupport'

jest.mock('maplibre-gl')

describe('MapTab URL state', () => {
  beforeEach(resetMapMocks)

  it('shows a URL-loaded free-text filter in the input and the results', async () => {
    const provenances = [
      makeProvenance({ id: 'babylon', longName: 'Babylon' }),
      makeProvenance({ id: 'nippur', longName: 'Nippur' }),
    ]

    renderMapTab(
      makeFragmentService(provenances),
      '/tools/map?mv=1&findspot=bab',
    )

    const input = await screen.findByLabelText('Filter findspots by name')
    await waitFor(() => expect(input).toHaveValue('bab'))
    expect(screen.getByRole('link', { name: 'Babylon' })).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'Nippur' }),
    ).not.toBeInTheDocument()
  })

  it('does not add a query string on a plain visit with no filter', async () => {
    renderMapTab(makeFragmentService([makeProvenance()]))

    await screen.findByLabelText('Filter findspots by name')

    await waitFor(() => {
      expect(screen.getByTestId(CURRENT_LOCATION_TEST_ID)).toHaveTextContent(
        '/tools/map',
      )
    })
    expect(screen.getByTestId(CURRENT_LOCATION_TEST_ID)).not.toHaveTextContent(
      '?',
    )
  })

  it('writes a typed filter to the URL', async () => {
    renderMapTab(makeFragmentService([makeProvenance()]))

    const input = await screen.findByLabelText('Filter findspots by name')
    await userEvent.type(input, 'bab')

    await waitFor(() => {
      expect(screen.getByTestId(CURRENT_LOCATION_TEST_ID)).toHaveTextContent(
        'findspot=bab',
      )
    })
  })

  it('shows the same capped filter that it writes to the URL', async () => {
    renderMapTab(makeFragmentService([makeProvenance()]))
    const overlongFilter = 'a'.repeat(MAX_FILTER_LENGTH + 50)
    const cappedFilter = 'a'.repeat(MAX_FILTER_LENGTH)

    const input = await screen.findByLabelText('Filter findspots by name')
    fireEvent.change(input, { target: { value: overlongFilter } })

    await waitFor(() => expect(input).toHaveValue(cappedFilter))
    const location = screen.getByTestId(CURRENT_LOCATION_TEST_ID).textContent
    const search = location?.split('?')[1] ?? ''
    expect(parseMapUrlState(search).filter).toBe(cappedFilter)
  })

  it('resets the filter, active panel and camera while preserving unrelated URL state', async () => {
    renderMapTab(
      makeFragmentService([makeProvenance()]),
      '/tools/map?outside=keep&mv=1&findspot=bab',
    )
    const input = await screen.findByLabelText('Filter findspots by name')
    await userEvent.click(screen.getByRole('button', { name: 'Map layers' }))
    expect(screen.getByRole('button', { name: 'Map layers' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )

    await userEvent.click(screen.getByRole('button', { name: 'Reset view' }))

    await waitFor(() => expect(input).toHaveValue(''))
    expect(screen.getByRole('button', { name: 'Map layers' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    expect(screen.getByTestId(CURRENT_LOCATION_TEST_ID)).toHaveTextContent(
      '/tools/map?outside=keep',
    )
    expect(mockEaseTo).toHaveBeenCalledWith({
      center: INITIAL_CENTER,
      zoom: INITIAL_ZOOM,
    })
  })
})
