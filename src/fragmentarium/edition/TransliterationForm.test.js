import React from 'react'
import { render, waitForElement, wait } from 'react-testing-library'
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
    isAllowedToRead: () => true,
    isAllowedToTransliterate: () => true
  }
  element = render(<TransliteratioForm
    number={number}
    transliteration={transliteration}
    notes={notes}
    fragmentService={fragmentService}
    onChange={onChange}
  />)
})

xit('Updates transliteration on change', async () => {
  const newTransliteration = 'line1\nline2\nnew line'
  await changeValueByLabel(element, 'Transliteration', newTransliteration)

  expect(element.getByLabelText('Transliteration').value).toEqual(newTransliteration)
})

xit('Updates notes on change', async () => {
  const newNotes = 'some notes'
  await changeValueByLabel(element, 'Notes', newNotes)

  expect(element.getByLabelText('Notes').value).toEqual(newNotes)
})

describe('Save', () => {
  beforeEach(async () => {
    fragmentService.updateTransliteration.mockReturnValueOnce(Promise.resolve())
    submitForm(element, '#transliteration-form')
  })

  it('Posts transliteration to API', () => {
    expect(fragmentService.updateTransliteration)
      .toHaveBeenCalledWith(number, transliteration, notes)
  })

  it('Calls onChange', async () => {
    await wait(() => expect(onChange).toHaveBeenCalled())
  })
})

it('Shows error if saving transliteration fails', async () => {
  fragmentService.updateTransliteration.mockReturnValueOnce(Promise.reject(new Error(errorMessage)))

  submitForm(element, '#transliteration-form')

  await waitForElement(() => element.getByText(errorMessage))
})

it('Cancels post on unmount', () => {
  const promise = new Promise(_.noop)
  jest.spyOn(promise, 'cancel')
  fragmentService.updateTransliteration.mockReturnValueOnce(promise)
  submitForm(element, '#transliteration-form')
  element.unmount()
  expect(promise.isCancelled()).toBe(true)
})

xit('Shows transliteration', () => {
  expect(element.getByLabelText('Transliteration').value).toEqual(transliteration)
})

xit('Shows notes', () => {
  expect(element.getByLabelText('Notes').value).toEqual(notes)
})
