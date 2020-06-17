import React from 'react'
import { Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'
import { render } from '@testing-library/react'
import { changeValueByLabel, submitForm } from 'test-support/utils'

import TransliterationSearchForm from './TransliterationSearchForm'

it('Adds number to query string on submit', async () => {
  const transliteration = 'ma i-ra\nka li'
  const history = createMemoryHistory()
  jest.spyOn(history, 'push')
  const element = render(
    <Router history={history}>
      <TransliterationSearchForm transliteration={null} />
    </Router>
  )

  changeValueByLabel(element, 'Transliteration', transliteration)
  await submitForm(element)

  expect(history.push).toBeCalledWith(
    `/fragmentarium/search/?transliteration=${encodeURIComponent(
      transliteration
    )}`
  )
})

it('calling render with the same component on the same container does not remount', () => {
  const history = createMemoryHistory()
  jest.spyOn(history, 'push')
  const { getByLabelText, rerender } = render(
    <Router history={history}>
      <TransliterationSearchForm transliteration="pak" />
    </Router>
  )
  expect((getByLabelText('Transliteration') as HTMLInputElement).value).toBe(
    'pak'
  )

  rerender(
    <Router history={history}>
      <TransliterationSearchForm transliteration={undefined} />
    </Router>
  )
  expect((getByLabelText('Transliteration') as HTMLInputElement).value).toBe('')
})
