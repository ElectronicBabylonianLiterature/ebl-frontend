import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { INITIAL_CENTER, INITIAL_ZOOM } from 'map/maplibre/mapCamera'
import {
  makeFragmentService,
  makeProvenance,
  mockEaseTo,
  renderMapTab,
  resetMapMocks,
} from 'map/ui/MapTab.testSupport'

jest.mock('maplibre-gl')
beforeEach(resetMapMocks)

it('resets map orientation and zoom when Reset view is activated', async () => {
  renderMapTab(makeFragmentService([makeProvenance()]))
  await screen.findByLabelText('Filter findspots by name')
  mockEaseTo.mockClear()
  await userEvent.click(screen.getByRole('button', { name: 'Reset view' }))
  await waitFor(() =>
    expect(mockEaseTo).toHaveBeenCalledWith({
      center: INITIAL_CENTER,
      zoom: INITIAL_ZOOM,
      bearing: 0,
      pitch: 0,
    }),
  )
})
