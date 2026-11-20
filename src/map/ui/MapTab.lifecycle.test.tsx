import { act, screen, waitFor } from '@testing-library/react'
import fetchMock from 'jest-fetch-mock'
import FragmentService from 'fragmentarium/application/FragmentService'

import {
  makeFailingFragmentService,
  makeProvenance,
  makeRejectingFragmentService,
  renderMapTab,
  resetMapMocks,
} from 'map/ui/MapTab.testSupport'

jest.mock('maplibre-gl')

describe('MapTab data loading lifecycle', () => {
  beforeEach(() => {
    resetMapMocks()
    fetchMock.resetMocks()
  })

  it('renders loading spinner while data is being fetched', () => {
    const fragmentService = {
      fetchProvenances: () => new Promise(() => {}),
    } as unknown as FragmentService

    renderMapTab(fragmentService)

    expect(screen.getByText('Loading map data...')).toBeInTheDocument()
  })

  it('renders error state when fetch fails', async () => {
    renderMapTab(makeFailingFragmentService('Network error'))

    await waitFor(() => {
      expect(
        screen.getByText('Failed to load map data: Network error'),
      ).toBeInTheDocument()
    })
  })

  it('renders a generic error state when the fetch rejects without an Error', async () => {
    renderMapTab(makeRejectingFragmentService('offline'))

    expect(
      await screen.findByText('Failed to load map data: Unknown error'),
    ).toBeInTheDocument()
  })

  it.each(['success', 'rejection'])(
    'does not update state after unmount before fetch %s',
    async (outcome) => {
      let resolveFetch!: (
        provenances: readonly ReturnType<typeof makeProvenance>[],
      ) => void
      let rejectFetch!: (error: Error) => void
      const fragmentService = {
        fetchProvenances: () =>
          new Promise((resolve, reject) => {
            resolveFetch = resolve
            rejectFetch = reject
          }),
      } as unknown as FragmentService

      const { unmount } = renderMapTab(fragmentService)
      unmount()

      await act(async () => {
        if (outcome === 'success') {
          resolveFetch([makeProvenance()])
        } else {
          rejectFetch(new Error('Late failure'))
        }
      })

      expect(screen.queryByText(/Late failure/)).not.toBeInTheDocument()
      expect(screen.queryByText('Loading map data...')).not.toBeInTheDocument()
    },
  )
})
