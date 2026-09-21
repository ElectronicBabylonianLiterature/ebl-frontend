import React from 'react'
import { act, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom'
import type { InitialEntry } from 'history'
import { MAX_FILTER_LENGTH, parseMapUrlState } from 'map/mapUrlState'
import useMapUrlState from 'map/useMapUrlState'

const FILTER_TEST_ID = 'harness-filter'
const SEARCH_TEST_ID = 'harness-search'
const HASH_TEST_ID = 'harness-hash'
const STATE_TEST_ID = 'harness-state'
const OVERLONG_FILTER = 'a'.repeat(MAX_FILTER_LENGTH + 50)
const CAPPED_FILTER = 'a'.repeat(MAX_FILTER_LENGTH)

function CurrentLocation(): JSX.Element {
  const location = useLocation()
  return (
    <div>
      <div data-testid={SEARCH_TEST_ID}>{location.search}</div>
      <div data-testid={HASH_TEST_ID}>{location.hash}</div>
      <div data-testid={STATE_TEST_ID}>{JSON.stringify(location.state)}</div>
    </div>
  )
}

function Harness(): JSX.Element {
  const { state, update } = useMapUrlState()
  const navigate = useNavigate()

  return (
    <div>
      <div data-testid={FILTER_TEST_ID}>{state.filter}</div>
      <button onClick={() => update({ filter: 'Babylon' })}>set-babylon</button>
      <button onClick={() => update({ filter: OVERLONG_FILTER })}>
        set-overlong
      </button>
      <button onClick={() => update({ filter: '' })}>clear</button>
      <button onClick={() => navigate('/tools/map?mv=1&findspot=External')}>
        external-nav
      </button>
      <button
        onClick={() => {
          update({ filter: 'Local' })
          navigate('/tools/map?mv=1&findspot=External')
        }}
      >
        local-and-external
      </button>
    </div>
  )
}

function renderHarness(initialEntry: InitialEntry = '/tools/map'): void {
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Harness />
      <CurrentLocation />
    </MemoryRouter>,
  )
}

describe('useMapUrlState', () => {
  it('parses the filter already present in the URL on mount', () => {
    renderHarness('/tools/map?mv=1&findspot=Babylon')

    expect(screen.getByTestId(FILTER_TEST_ID)).toHaveTextContent('Babylon')
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
      expect(screen.getByTestId(SEARCH_TEST_ID)).toBeEmptyDOMElement()
    })
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
