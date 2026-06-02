import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'

import SignsSearchForm from 'signs/ui/search/SignsSearchForm'
import userEvent from '@testing-library/user-event'

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

const routerFuture = Object.fromEntries([
  ['v7_startTransition', true],
  ['v7_relativeSplatPath', true],
])

it('Adds lemma to query string on submit', async () => {
  renderSignsSearchForm()
  await userEvent.type(screen.getByPlaceholderText('Sign or Reading'), 'ba')
  await userEvent.click(screen.getAllByRole('button')[0])

  expect(mockNavigate).toHaveBeenCalledWith(
    '?listsName&listsNumber&sign=ba&subIndex=1&value=ba',
  )
})

it('Extracts subIndex from accent-encoded sign on submit', async () => {
  renderSignsSearchForm()
  await userEvent.type(screen.getByPlaceholderText('Sign or Reading'), 'šá')
  await userEvent.click(screen.getAllByRole('button')[0])

  expect(mockNavigate).toHaveBeenCalledWith(
    '?listsName&listsNumber&sign=%C5%A1a%E2%82%82&subIndex=2&value=%C5%A1a',
  )
})

it('Prefers explicit subIndex over accent-encoded subIndex on submit', async () => {
  renderSignsSearchForm()
  await userEvent.type(screen.getByPlaceholderText('Sign or Reading'), 'šá3')
  await userEvent.click(screen.getAllByRole('button')[0])

  expect(mockNavigate).toHaveBeenCalledWith(
    '?listsName&listsNumber&sign=%C5%A1a3%E2%82%82&subIndex=3&value=%C5%A1a',
  )
})

function renderSignsSearchForm() {
  const signQueryDefault = {
    value: undefined,
    subIndex: undefined,
    listsName: undefined,
    listsNumber: undefined,
    isIncludeHomophones: undefined,
    isComposite: undefined,
  }
  return render(
    <MemoryRouter future={routerFuture}>
      <SignsSearchForm sign={undefined} signQuery={signQueryDefault} />
    </MemoryRouter>,
  )
}
