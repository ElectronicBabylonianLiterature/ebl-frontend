import React from 'react'
import { Router } from 'react-router-dom'
import createMemoryHistory from 'history/createMemoryHistory'
import { render, cleanup } from 'react-testing-library'
import { changeValueByLabel, submitForm } from 'testHelpers'

import WordSearchForm from './WordSearchForm'

afterEach(cleanup)

it('Adds lemma to query string on submit', async () => {
  const history = createMemoryHistory()
  jest.spyOn(history, 'push')
  const element = render(<Router history={history}><WordSearchForm /></Router>)

  await changeValueByLabel(element, 'Query', 'lemma')
  await submitForm(element, 'form')

  expect(history.push).toBeCalledWith('?query=lemma')
})
