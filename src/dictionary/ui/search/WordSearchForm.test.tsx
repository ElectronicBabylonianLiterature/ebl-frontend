import React from 'react'
import { Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'
import { render, screen } from '@testing-library/react'
import { changeValueByLabel, submitForm } from 'test-support/utils'

import WordSearchForm from './WordSearchForm'

it('Adds lemma to query string on submit', async () => {
  const history = createMemoryHistory()
  jest.spyOn(history, 'push')
  const { container } = render(
    <Router history={history}>
      <WordSearchForm query={null} />
    </Router>
  )

  changeValueByLabel(screen, 'Query', 'lemma')
  await submitForm(container)

  expect(history.push).toBeCalledWith('?query=lemma')
})
