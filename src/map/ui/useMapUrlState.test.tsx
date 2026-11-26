import { act, screen, waitFor } from '@testing-library/react'
import { parseMapUrlState } from 'map/domain/mapUrlState'
import {
  AREAS_TEST_ID,
  CAPPED_FILTER,
  FILTER_TEST_ID,
  HASH_TEST_ID,
  SEARCH_TEST_ID,
  STATE_TEST_ID,
  renderHarness,
} from 'map/ui/useMapUrlState.testSupport'

describe('useMapUrlState', () => {
  it('parses the filter already present in the URL on mount', () => {
    renderHarness('/tools/map?mv=1&findspot=Babylon')

    expect(screen.getByTestId(FILTER_TEST_ID)).toHaveTextContent('Babylon')
  })

  it('parses the excavation-area flag already present in the URL', () => {
    renderHarness('/tools/map?mv=1&areas=1')

    expect(screen.getByTestId(AREAS_TEST_ID)).toHaveTextContent('true')
  })

  it('does not rewrite the URL on a plain visit with no query', async () => {
    renderHarness('/tools/map')

    await waitFor(() => {
      expect(screen.getByTestId(SEARCH_TEST_ID)).toBeEmptyDOMElement()
    })
  })

  it('does not rewrite a URL with a future map-state version', async () => {
    renderHarness('/tools/map?mv=2&findspot=Future&source=archive')

    await waitFor(() => {
      expect(screen.getByTestId(SEARCH_TEST_ID)).toHaveTextContent(
        '?mv=2&findspot=Future&source=archive',
      )
    })
  })

  it('writes the filter to the URL and clears it again', async () => {
    renderHarness('/tools/map')

    act(() => {
      screen.getByText('set-babylon').click()
    })

    await waitFor(() => {
      expect(screen.getByTestId(SEARCH_TEST_ID)).toHaveTextContent(
        /findspot=Babylon/,
      )
    })
    expect(screen.getByTestId(SEARCH_TEST_ID)).toHaveTextContent(/mv=1/)

    act(() => {
      screen.getByText('clear').click()
    })

    await waitFor(() => {
      expect(screen.getByTestId(SEARCH_TEST_ID)).toHaveTextContent(
        '?mv=1&areas=1',
      )
    })
  })

  it('writes explicit enabled and disabled excavation-area flags', async () => {
    renderHarness('/tools/map?source=archive&mv=1&areas=0')

    act(() => {
      screen.getByText('show-areas').click()
    })

    await waitFor(() => {
      expect(screen.getByTestId(AREAS_TEST_ID)).toHaveTextContent('true')
    })
    expect(screen.getByTestId(SEARCH_TEST_ID)).toHaveTextContent(/areas=1/)
    expect(screen.getByTestId(SEARCH_TEST_ID)).toHaveTextContent(/mv=1/)
    expect(screen.getByTestId(SEARCH_TEST_ID)).toHaveTextContent(
      /source=archive/,
    )

    act(() => {
      screen.getByText('hide-areas').click()
    })

    await waitFor(() => {
      expect(screen.getByTestId(AREAS_TEST_ID)).toHaveTextContent('false')
    })
    expect(screen.getByTestId(SEARCH_TEST_ID)).toHaveTextContent(
      '?source=archive&mv=1&areas=0',
    )
  })

  it('preserves query parameters not owned by the map', async () => {
    renderHarness('/tools/map?source=archive')

    act(() => {
      screen.getByText('set-babylon').click()
    })

    await waitFor(() => {
      expect(screen.getByTestId(SEARCH_TEST_ID)).toHaveTextContent(
        /source=archive/,
      )
    })
    expect(screen.getByTestId(SEARCH_TEST_ID)).toHaveTextContent(
      /findspot=Babylon/,
    )
  })

  it('lets external map state win over a pending local write', async () => {
    renderHarness('/tools/map?mv=1&findspot=Initial')

    act(() => {
      screen.getByText('local-and-external').click()
    })

    await waitFor(() => {
      expect(screen.getByTestId(FILTER_TEST_ID)).toHaveTextContent('External')
    })
    expect(screen.getByTestId(SEARCH_TEST_ID)).toHaveTextContent(
      '?mv=1&findspot=External',
    )
  })

  it('picks up a filter from an external navigation', async () => {
    renderHarness('/tools/map')

    act(() => {
      screen.getByText('external-nav').click()
    })

    await waitFor(() => {
      expect(screen.getByTestId(FILTER_TEST_ID)).toHaveTextContent('External')
    })
  })

  it('lets external navigation to the current query override a pending local write', () => {
    renderHarness('/tools/map?mv=1&findspot=Initial')

    act(() => screen.getByText('local-and-current').click())

    expect(screen.getByTestId(SEARCH_TEST_ID)).toHaveTextContent(
      '?mv=1&findspot=Initial',
    )
    expect(screen.getByTestId(FILTER_TEST_ID)).toHaveTextContent('Initial')
  })

  it('preserves the hash and router state when writing a filter', async () => {
    renderHarness({
      pathname: '/tools/map',
      hash: '#findspot-map-description',
      state: { source: 'map-link' },
    })

    act(() => {
      screen.getByText('set-babylon').click()
    })

    await waitFor(() => {
      expect(screen.getByTestId(SEARCH_TEST_ID)).toHaveTextContent(
        /findspot=Babylon/,
      )
    })
    expect(screen.getByTestId(HASH_TEST_ID)).toHaveTextContent(
      '#findspot-map-description',
    )
    expect(screen.getByTestId(STATE_TEST_ID)).toHaveTextContent(
      '{"source":"map-link"}',
    )
  })

  it('stores the same capped filter that it writes to the URL', async () => {
    renderHarness()

    act(() => {
      screen.getByText('set-overlong').click()
    })

    await waitFor(() => {
      expect(screen.getByTestId(FILTER_TEST_ID)).toHaveTextContent(
        CAPPED_FILTER,
      )
    })
    const search = screen.getByTestId(SEARCH_TEST_ID).textContent ?? ''
    expect(parseMapUrlState(search).filter).toBe(CAPPED_FILTER)
  })
})
