import React from 'react'
import { act, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom'
import useMapUrlState from 'map/useMapUrlState'

const FILTER_TEST_ID = 'harness-filter'
const SEARCH_TEST_ID = 'harness-search'

function CurrentSearch(): JSX.Element {
  const location = useLocation()
  return <div data-testid={SEARCH_TEST_ID}>{location.search}</div>
}

function Harness(): JSX.Element {
  const { state, update } = useMapUrlState()
  const navigate = useNavigate()

  return (
    <div>
      <div data-testid={FILTER_TEST_ID}>{state.filter}</div>
      <button onClick={() => update({ filter: 'Babylon' })}>set-babylon</button>
      <button onClick={() => update({ filter: '' })}>clear</button>
      <button onClick={() => navigate('/tools/map?mv=1&findspot=External')}>
        external-nav
      </button>
    </div>
  )
}

function renderHarness(initialEntry = '/tools/map'): void {
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Harness />
      <CurrentSearch />
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
      expect(screen.getByTestId(SEARCH_TEST_ID)).toHaveTextContent('')
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
      expect(screen.getByTestId(SEARCH_TEST_ID)).toHaveTextContent('')
    })
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
})
