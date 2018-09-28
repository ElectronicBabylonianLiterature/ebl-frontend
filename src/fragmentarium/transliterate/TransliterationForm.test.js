import React from 'react'
import { render } from 'react-testing-library'
import { Promise } from 'bluebird'
import _ from 'lodash'
import { changeValueByLabel, submitForm } from 'testHelpers'

import TransliteratioForm from './TransliterationForm'

const errorMessage = 'error message'
const number = 'K.00000'
const transliteration = 'line1\nline2'
const notes = 'notes'

let fragmentService
let element
let onChange

beforeEach(() => {
  onChange = jest.fn()
  fragmentService = {
    updateTransliteration: jest.fn(),
    allowedToRead: () => true,
    allowedToTransliterate: jest.fn()
  }
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
      fragmentService.updateTransliteration.mockReturnValueOnce(Promise.resolve())

      await submitForm(element, '#transliteration-form')
    })

    it('Posts transliteration to API', () => {
      expect(fragmentService.updateTransliteration)
        .toHaveBeenCalledWith(number, transliteration, notes)
    })

    it('Calls onChange', () => {
      expect(onChange).toHaveBeenCalled()
    })
  })

  it('Shows error if saving transliteration fails', async () => {
    fragmentService.updateTransliteration.mockReturnValueOnce(Promise.reject(new Error(errorMessage)))

    await submitForm(element, '#transliteration-form')

    expect(element.container).toHaveTextContent(errorMessage)
  })

  it('Cancels post on unmount', async () => {
    const promise = new Promise(_.noop)
    jest.spyOn(promise, 'cancel')
    fragmentService.updateTransliteration.mockReturnValueOnce(promise)
    submitForm(element, '#transliteration-form')
    element.unmount()
    expect(promise.isCancelled()).toBe(true)
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
}

function renderTransliterationForm (isAllowed) {
  fragmentService.allowedToTransliterate.mockReturnValue(isAllowed)
  element = render(<TransliteratioForm
    number={number}
    transliteration={transliteration}
    notes={notes}
    fragmentService={fragmentService}
    onChange={onChange}
  />)
}
