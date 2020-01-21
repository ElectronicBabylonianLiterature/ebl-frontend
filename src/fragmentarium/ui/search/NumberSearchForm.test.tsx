import React from 'react'
import { Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'
import { render } from '@testing-library/react'
import { changeValueByLabel, submitForm } from 'test-helpers/utils'

import NumberSearchForm from './NumberSearchForm'

it('Adds number to query string on submit', async () => {
  const history = createMemoryHistory()
  jest.spyOn(history, 'push')
  const element = render(
    <Router history={history}>
      <NumberSearchForm number={null} />
    </Router>
  )

  changeValueByLabel(element, 'Number', 'K.3')
  await submitForm(element)

  expect(history.push).toBeCalledWith('/fragmentarium/search/?number=K.3')
})
