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
