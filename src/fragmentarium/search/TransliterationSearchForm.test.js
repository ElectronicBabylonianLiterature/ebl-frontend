import React from 'react'
import { Router } from 'react-router-dom'
import createMemoryHistory from 'history/createMemoryHistory'
import { render, cleanup } from 'react-testing-library'
import { changeValueByLabel, submitForm } from 'testHelpers'

import TransliterationSearchForm from './TransliterationSearchForm'

afterEach(cleanup)

it('Adds number to query string on submit', async () => {
  const transliteration = 'ma i-ra\nka li'
  const history = createMemoryHistory()
  jest.spyOn(history, 'push')
  const element = render(<Router history={history}><TransliterationSearchForm /></Router>)

  await changeValueByLabel(element, 'Transliteration', transliteration)
  await submitForm(element, 'form')

  expect(history.push).toBeCalledWith(`?transliteration=${encodeURIComponent(transliteration)}`)
})
