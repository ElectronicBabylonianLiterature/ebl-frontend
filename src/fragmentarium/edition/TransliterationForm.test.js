import React from 'react'
import { render } from 'react-testing-library'
import { changeValueByLabel, submitFormByTestId } from 'test-helpers/utils'
import { Promise } from 'bluebird'

import TransliteratioForm from './TransliterationForm'

const number = 'K.00000'
const transliteration = 'line1\nline2'
const notes = 'notes'

let updateTransliteration
let element

beforeEach(() => {
  updateTransliteration = jest.fn()
  updateTransliteration.mockReturnValue(Promise.resolve())
  element = render(
    <TransliteratioForm
      number={number}
      transliteration={transliteration}
      notes={notes}
      updateTransliteration={updateTransliteration}
    />
  )
})

test('Submitting the from calls updateTransliteration', () => {
  submitFormByTestId(element, 'transliteration-form')
  expect(updateTransliteration).toHaveBeenCalledWith(transliteration, notes)
})

xit('Updates transliteration on change', () => {
  const newTransliteration = 'line1\nline2\nnew line'
  changeValueByLabel(element, 'Transliteration', newTransliteration)

  expect(element.getByLabelText('Transliteration').value).toEqual(
    newTransliteration
  )
})

xit('Updates notes on change', () => {
  const newNotes = 'some notes'
  changeValueByLabel(element, 'Notes', newNotes)

  expect(element.getByLabelText('Notes').value).toEqual(newNotes)
})

xit('Shows transliteration', () => {
  expect(element.getByLabelText('Transliteration').value).toEqual(
    transliteration
  )
})

xit('Shows notes', () => {
  expect(element.getByLabelText('Notes').value).toEqual(notes)
})
