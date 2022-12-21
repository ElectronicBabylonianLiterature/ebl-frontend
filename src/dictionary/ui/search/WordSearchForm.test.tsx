import React from 'react'
import { Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'
import { render, screen } from '@testing-library/react'
import { changeValueByLabel, submitForm } from 'test-support/utils'
import WordSearchForm from 'dictionary/ui/search/WordSearchForm'
import { stringify } from 'query-string'

const query = { word: '', meaning: '', root: '', vowelClass: '' }
const modifiedQuery = {
  word: 'lemma',
  meaning: 'some meaning',
  root: 'lmm',
  vowelClass: 'a/a',
}

it('Adds lemma to query string on submit', async () => {
  const history = createMemoryHistory()
  jest.spyOn(history, 'push')
  const { container } = render(
    <Router history={history}>
      <WordSearchForm query={query} />
    </Router>
  )

  changeValueByLabel(screen, 'Word', 'lemma')
  changeValueByLabel(screen, 'Meaning', 'some meaning')
  changeValueByLabel(screen, 'Root', 'lmm')
  changeValueByLabel(screen, 'Vowel class', 'a/a')
  await submitForm(container)

  expect(history.push).toBeCalledWith(`?${stringify(modifiedQuery)}`)
})
