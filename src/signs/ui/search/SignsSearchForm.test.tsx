import React from 'react'
import { Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'
import { render, screen } from '@testing-library/react'

import SignsSearchForm from 'signs/ui/search/SignsSearchForm'
import userEvent from '@testing-library/user-event'

const history = createMemoryHistory()

it('Adds lemma to query string on submit', async () => {
  renderSignsSearchForm()
  jest.spyOn(history, 'push')
  userEvent.type(screen.getByPlaceholderText('Sign or Reading'), 'ba')
  userEvent.click(screen.getAllByRole('button')[0])

  expect(history.push).toBeCalledWith('?sign=ba&subIndex=1&value=ba')
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
    <Router history={history}>
      <SignsSearchForm sign={undefined} signQuery={signQueryDefault} />
    </Router>
  )
}
