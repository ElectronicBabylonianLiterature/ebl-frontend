import React from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom'
import type { InitialEntry } from 'history'
import { MAX_FILTER_LENGTH } from 'map/domain/mapUrlState'
import useMapUrlState from 'map/ui/useMapUrlState'

export const FILTER_TEST_ID = 'harness-filter'
export const AREAS_TEST_ID = 'harness-areas'
export const SEARCH_TEST_ID = 'harness-search'
export const HASH_TEST_ID = 'harness-hash'
export const STATE_TEST_ID = 'harness-state'
export const SELECTION_TEST_ID = 'harness-selection'
const OVERLONG_FILTER = 'a'.repeat(MAX_FILTER_LENGTH + 50)
export const CAPPED_FILTER = 'a'.repeat(MAX_FILTER_LENGTH)

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
      <div data-testid={AREAS_TEST_ID}>{String(state.showExcavationAreas)}</div>
      <div data-testid={SELECTION_TEST_ID}>{state.selection?.polygonId}</div>
      <button
        onClick={() =>
          update({
            selection: { type: 'excavation-area', polygonId: 'assur-area-a' },
          })
        }
      >
        select-area
      </button>
      <button onClick={() => update({ selection: null })}>clear-area</button>
      <button
        onClick={() => {
          update({
            selection: { type: 'excavation-area', polygonId: 'assur-area-a' },
          })
          update({ selection: null })
        }}
      >
        select-and-clear-area
      </button>
      <button onClick={() => update({ filter: 'Babylon' })}>set-babylon</button>
      <button onClick={() => update({ showExcavationAreas: true })}>
        show-areas
      </button>
      <button onClick={() => update({ showExcavationAreas: false })}>
        hide-areas
      </button>
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
      <button
        onClick={() => {
          update({ filter: 'Local' })
          navigate('/tools/map?mv=1&findspot=Initial')
        }}
      >
        local-and-current
      </button>
    </div>
  )
}

export function renderHarness(initialEntry: InitialEntry = '/tools/map'): void {
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Harness />
      <CurrentLocation />
    </MemoryRouter>,
  )
}
