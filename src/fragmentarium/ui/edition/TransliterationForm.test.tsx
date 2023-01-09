import React from 'react'
import { render, screen } from '@testing-library/react'
import { changeValueByLabel, submitFormByTestId } from 'test-support/utils'
import { Promise } from 'bluebird'

import TransliterationForm from './TransliterationForm'

const transliteration = 'line1\nline2'
const notes = 'notes'
const introduction = 'introduction'

let updateEdition

beforeEach(() => {
  updateEdition = jest.fn()
  updateEdition.mockReturnValue(Promise.resolve())

  render(
    <TransliterationForm
      transliteration={transliteration}
      notes={notes}
      introduction={introduction}
      updateEdition={updateEdition}
    />
  )
})

test('Submitting the form calls updateEdition', () => {
  submitFormByTestId(screen, 'transliteration-form')
  expect(updateEdition).toHaveBeenCalledWith(
    transliteration,
    notes,
    introduction
  )
})

xit('Updates transliteration on change', () => {
  const newTransliteration = 'line1\nline2\nnew line'
  changeValueByLabel(screen, 'Transliteration', newTransliteration)

  expect(screen.getByLabelText('Transliteration')).toHaveValue(
    newTransliteration
  )
})

xit('Updates introduction on change', () => {
  const newIntroduction = 'Introduction\n\nintroduction continued'
  changeValueByLabel(screen, 'Introduction', newIntroduction)

  expect(screen.getByLabelText('Introduction')).toHaveValue(newIntroduction)
})
