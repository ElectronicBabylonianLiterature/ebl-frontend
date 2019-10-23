import React from 'react'
import { Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'
import { render } from '@testing-library/react'
import { changeValueByLabel, submitForm } from 'test-helpers/utils'

import WordSearchForm from './WordSearchForm'

it('Adds lemma to query string on submit', () => {
  const history = createMemoryHistory()
  jest.spyOn(history, 'push')
  const element = render(
    <Router history={history}>
      <WordSearchForm query={null} />
    </Router>
  )

  changeValueByLabel(element, 'Query', 'lemma')
  submitForm(element, 'form')

  expect(history.push).toBeCalledWith('?query=lemma')
})
