import React from 'react'
import { Router } from 'react-router-dom'
import createMemoryHistory from 'history/createMemoryHistory'
import {render, cleanup, fireEvent, wait} from 'react-testing-library'
import { changeValueByLabel } from 'testHelpers'

import WordSearchForm from './WordSearchForm'

afterEach(cleanup)

it('Adds lemma to query string on submit', async () => {
  const history = createMemoryHistory()
  jest.spyOn(history, 'push')
  const element = render(<Router history={history}><WordSearchForm /></Router>)

  await changeValueByLabel(element, 'Query', 'lemma')
  fireEvent.submit(element.container.querySelector('form'))
  await wait()

  expect(history.push).toBeCalledWith('?query=lemma')
})
