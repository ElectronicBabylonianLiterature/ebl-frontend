import React from 'react'
import { render, cleanup, fireEvent, wait } from 'react-testing-library'
import { changeValueByLabel } from 'testHelpers'

import TransliteratioForm from './TransliterationForm'
import ApiClient from 'http/ApiClient'
import Auth from 'auth0/Auth'

const number = 'K.00000'
const transliteration = 'line1\nline2'

let apiClient
let element
let onChange

afterEach(cleanup)

beforeEach(() => {
  onChange = jest.fn()
  apiClient = new ApiClient(new Auth())
  element = render(<TransliteratioForm
    number={number}
    transliteration={transliteration}
    apiClient={apiClient}
    onChange={onChange}
  />)
})

it('Shows transliteration', () => {
  expect(element.getByLabelText('Transliteration').value).toEqual(transliteration)
})

it('Updates transliteration on change', async () => {
  const newTransliteration = 'line1\nline2\nnew line'
  await changeValueByLabel(element, 'Transliteration', newTransliteration)

  expect(element.getByLabelText('Transliteration').value).toEqual(newTransliteration)
})

it('Posts transliteration to API on save', async () => {
  jest.spyOn(apiClient, 'postJson').mockReturnValueOnce(Promise.resolve())

  fireEvent.submit(element.container.querySelector('#transliteration-form'))
  await wait()

  expect(apiClient.postJson)
    .toHaveBeenCalledWith(`/fragments/${number}/transliteration`, transliteration)
})

it('Calls onChange on save', async () => {
  jest.spyOn(apiClient, 'postJson').mockReturnValueOnce(Promise.resolve())

  fireEvent.submit(element.container.querySelector('#transliteration-form'))
  await wait()

  expect(onChange).toHaveBeenCalled()
})

it('Shows error if saving transliteration fails', async () => {
  const errorMessage = 'error message'
  jest.spyOn(apiClient, 'postJson').mockReturnValueOnce(Promise.reject(new Error(errorMessage)))

  fireEvent.submit(element.container.querySelector('#transliteration-form'))
  await wait()

  expect(element.container).toHaveTextContent(errorMessage)
})
