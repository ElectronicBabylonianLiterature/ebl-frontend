import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
  CURRENT_LOCATION_TEST_ID,
  makeFragmentService,
  makeProvenance,
  renderMapTab,
  resetMapMocks,
} from 'map/MapTab.testSupport'

jest.mock('maplibre-gl')

describe('MapTab URL state', () => {
  beforeEach(resetMapMocks)

  it('shows the URL-loaded filter in the input and the results', async () => {
    const provenances = [
      makeProvenance({ id: 'babylon', longName: 'Babylon' }),
      makeProvenance({ id: 'nippur', longName: 'Nippur' }),
    ]

    renderMapTab(
      makeFragmentService(provenances),
      '/tools/map?mv=1&findspot=Babylon',
    )

    const input = await screen.findByLabelText('Filter findspots by name')
    await waitFor(() => expect(input).toHaveValue('Babylon'))
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
})
