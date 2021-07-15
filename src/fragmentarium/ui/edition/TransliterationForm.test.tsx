import React from 'react'
import { render, screen } from '@testing-library/react'
import { changeValueByLabel, submitFormByTestId } from 'test-support/utils'
import { Promise } from 'bluebird'

import TransliteratioForm from './TransliterationForm'

const transliteration = 'line1\nline2'
const notes = 'notes'

let updateTransliteration

beforeEach(() => {
  updateTransliteration = jest.fn()
  updateTransliteration.mockReturnValue(Promise.resolve())
  render(
    <TransliteratioForm
      transliteration={transliteration}
      notes={notes}
      updateTransliteration={updateTransliteration}
    />
  )
})

test('Submitting the from calls updateTransliteration', () => {
  submitFormByTestId(screen, 'transliteration-form')
  expect(updateTransliteration).toHaveBeenCalledWith(transliteration, notes)
})

xit('Updates transliteration on change', () => {
  const newTransliteration = 'line1\nline2\nnew line'
  changeValueByLabel(screen, 'Transliteration', newTransliteration)

  expect(screen.getByLabelText('Transliteration')).toHaveValue(
    newTransliteration
  )
})
