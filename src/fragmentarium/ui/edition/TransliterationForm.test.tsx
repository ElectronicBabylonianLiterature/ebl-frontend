import React from 'react'
import { render, screen } from '@testing-library/react'
import { changeValueByLabel, submitFormByTestId } from 'test-support/utils'
import { Promise } from 'bluebird'

import TransliterationForm from './TransliterationForm'

const transliteration = 'line1\nline2'
const notes = 'notes'
const introduction = 'introduction'

let updateTransliteration
let updateIntroduction

beforeEach(() => {
  updateTransliteration = jest.fn()
  updateTransliteration.mockReturnValue(Promise.resolve())

  updateIntroduction = jest.fn()
  updateIntroduction.mockReturnValue(Promise.resolve())

  render(
    <TransliterationForm
      transliteration={transliteration}
      notes={notes}
      introduction={introduction}
      updateTransliteration={updateTransliteration}
      updateIntroduction={updateIntroduction}
    />
  )
})

test('Submitting the form calls updateTransliteration', () => {
  submitFormByTestId(screen, 'transliteration-form')
  expect(updateTransliteration).toHaveBeenCalledWith(transliteration, notes)
})

test('Submitting the form calls updateIntroduction', () => {
  submitFormByTestId(screen, 'transliteration-form')
  expect(updateIntroduction).toHaveBeenCalledWith(introduction)
})

xit('Updates transliteration on change', () => {
  const newTransliteration = 'line1\nline2\nnew line'
  changeValueByLabel(screen, 'Transliteration', newTransliteration)

  expect(screen.getByLabelText('Transliteration')).toHaveValue(
    newTransliteration
  )
})
