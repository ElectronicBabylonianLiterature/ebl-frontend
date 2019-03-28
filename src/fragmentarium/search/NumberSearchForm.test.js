import React from 'react'
import { Router } from 'react-router-dom'
import createMemoryHistory from 'history/createMemoryHistory'
import { render } from 'react-testing-library'
import { changeValueByLabel, submitForm } from 'test-helpers/testHelpers'

import NumberSearchForm from './NumberSearchForm'

it('Adds number to query string on submit', async () => {
  const history = createMemoryHistory()
  jest.spyOn(history, 'push')
  const element = render(<Router history={history}><NumberSearchForm /></Router>)

  changeValueByLabel(element, 'Number', 'K.3')
  await submitForm(element, 'form')

  expect(history.push).toBeCalledWith('/fragmentarium/search/?number=K.3')
})
