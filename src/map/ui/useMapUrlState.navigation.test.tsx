import React from 'react'
import { act, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, useNavigate } from 'react-router-dom'
import useMapUrlState from 'map/ui/useMapUrlState'

function HistoryHarness(): JSX.Element {
  const { state } = useMapUrlState()
  const navigate = useNavigate()
  return (
    <>
      <output aria-label="Filter">{state.filter}</output>
      <output aria-label="Excavation areas">
        {String(state.showExcavationAreas)}
      </output>
      <button onClick={() => navigate(-1)}>Back</button>
      <button onClick={() => navigate(1)}>Forward</button>
    </>
  )
}

it('restores filter and explicit layer visibility through browser back and forward navigation', async () => {
  render(
    <MemoryRouter
      initialEntries={[
        '/tools/map?findspot=Uruk&areas=0',
        '/tools/map?mv=1&findspot=Babylon&areas=1',
      ]}
    >
      <HistoryHarness />
    </MemoryRouter>,
  )
  expect(screen.getByLabelText('Filter')).toHaveTextContent('Babylon')
  act(() => screen.getByText('Back').click())
  await waitFor(() =>
    expect(screen.getByLabelText('Filter')).toHaveTextContent('Uruk'),
  )
  expect(screen.getByLabelText('Excavation areas')).toHaveTextContent('false')
  act(() => screen.getByText('Forward').click())
  await waitFor(() =>
    expect(screen.getByLabelText('Filter')).toHaveTextContent('Babylon'),
  )
  expect(screen.getByLabelText('Excavation areas')).toHaveTextContent('true')
})
