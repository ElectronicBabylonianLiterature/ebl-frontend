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

it('Updates introduction on change', () => {
  const newIntroduction = 'Introduction\n\nintroduction continued'
  changeValueByLabel(screen, 'Introduction', newIntroduction)

  expect(screen.getByLabelText('Introduction')).toHaveValue(newIntroduction)
})
xit('Displays warning before closing when unsaved', () => {
  const newTransliteration = 'line1\nline2\nnew line'
  changeValueByLabel(screen, 'Transliteration', newTransliteration)

  const addEventListenerSpy = jest.spyOn(window, 'addEventListener')

  render(
    <TransliterationForm
      transliteration={newTransliteration}
      notes={notes}
      introduction={introduction}
      updateEdition={updateEdition}
    />
  )

  const event = new Event('beforeunload', { cancelable: true })
  window.dispatchEvent(event)

  expect(addEventListenerSpy).toHaveBeenCalledWith(
    'beforeunload',
    expect.any(Function)
  )
  expect(event).toContain(
    'You have unsaved changes. Are you sure you want to leave?'
  )
  addEventListenerSpy.mockRestore()
})
