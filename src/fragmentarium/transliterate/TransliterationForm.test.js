import React from 'react'
import { render, cleanup } from 'react-testing-library'
import { changeValueByLabel, submitForm, AbortError } from 'testHelpers'

import TransliteratioForm from './TransliterationForm'
import ApiClient from 'http/ApiClient'
import Auth from 'auth0/Auth'

const errorMessage = 'error message'
const number = 'K.00000'
const transliteration = 'line1\nline2'
const notes = 'notes'

let auth
let apiClient
let element
let onChange

afterEach(cleanup)

beforeEach(() => {
  onChange = jest.fn()
  auth = new Auth()
  apiClient = new ApiClient(auth)
})

describe('User has edit rights', () => {
  beforeEach(() => {
    renderTransliterationForm(true)
  })

  it('Updates transliteration on change', async () => {
    const newTransliteration = 'line1\nline2\nnew line'
    await changeValueByLabel(element, 'Transliteration', newTransliteration)

    expect(element.getByLabelText('Transliteration').value).toEqual(newTransliteration)
  })

  it('Updates notes on change', async () => {
    const newNotes = 'some notes'
    await changeValueByLabel(element, 'Notes', newNotes)

    expect(element.getByLabelText('Notes').value).toEqual(newNotes)
  })

  describe('Save', () => {
    beforeEach(async () => {
      jest.spyOn(apiClient, 'postJson').mockReturnValueOnce(Promise.resolve())

      await submitForm(element, '#transliteration-form')
    })

    it('Posts transliteration to API', () => {
      expect(apiClient.postJson)
        .toHaveBeenCalledWith(`/fragments/${number}`, {
          transliteration: transliteration,
          notes: notes
        },
        AbortController.prototype.signal)
    })

    it('Calls onChange', () => {
      expect(onChange).toHaveBeenCalled()
    })
  })

  it('Shows error if saving transliteration fails', async () => {
    jest.spyOn(apiClient, 'postJson').mockReturnValueOnce(Promise.reject(new Error(errorMessage)))

    await submitForm(element, '#transliteration-form')

    expect(element.container).toHaveTextContent(errorMessage)
  })

  it('Ignores AbortError', async () => {
    jest.spyOn(apiClient, 'postJson').mockReturnValueOnce(Promise.reject(new AbortError(errorMessage)))

    await submitForm(element, '#transliteration-form')

    expect(element.container).not.toHaveTextContent(errorMessage)
  })

  commonTests()
})

describe('User does not have edit rights', () => {
  beforeEach(() => {
    renderTransliterationForm(false)
  })

  it('The form is disabled', async () => {
    expect(element.container.querySelector('fieldset').disabled).toBe(true)
  })

  it('Save button is hidden', async () => {
    expect(element.queryByText('Save')).toBeNull()
  })

  it('Template form is hidden', async () => {
    expect(element.queryByLabelText('Template')).toBeNull()
  })

  commonTests()
})

function commonTests () {
  it('Shows transliteration', () => {
    expect(element.getByLabelText('Transliteration').value).toEqual(transliteration)
  })

  it('Shows notes', () => {
    expect(element.getByLabelText('Notes').value).toEqual(notes)
  })

  it('Aborts requests when unmounting', () => {
    element.unmount()
    expect(AbortController.prototype.abort).toHaveBeenCalled()
  })
}

function renderTransliterationForm (isAllowed) {
  jest.spyOn(auth, 'isAllowedTo').mockReturnValue(isAllowed)
  element = render(<TransliteratioForm
    number={number}
    transliteration={transliteration}
    notes={notes}
    apiClient={apiClient}
    auth={auth}
    onChange={onChange}
  />)
}
