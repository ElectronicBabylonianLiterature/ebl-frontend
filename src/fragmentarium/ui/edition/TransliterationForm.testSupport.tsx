import React from 'react'
import { render } from '@testing-library/react'
import TransliterationForm from 'fragmentarium/ui/edition/TransliterationForm'
import { editorState } from 'fragmentarium/ui/edition/TransliterationForm.mocks'

export const transliteration = 'line1\nline2'
export const notes = 'notes'
export const introduction = 'introduction'

export interface TransliterationFormTestContext {
  updateEdition: jest.Mock
  addEventListenerSpy: jest.SpyInstance
}

export function setUpTransliterationForm(
  updateEditionImplementation?: jest.Mock,
): TransliterationFormTestContext {
  jest.restoreAllMocks()
  editorState.error = null
  const addEventListenerSpy = jest.spyOn(window, 'addEventListener')
  const updateEdition = updateEditionImplementation ?? jest.fn()

  if (!updateEditionImplementation) {
    updateEdition.mockReturnValue(new Promise(() => undefined))
  }

  render(
    <TransliterationForm
      transliteration={transliteration}
      notes={notes}
      introduction={introduction}
      updateEdition={updateEdition}
    />,
  )

  return {
    updateEdition: updateEdition,
    addEventListenerSpy: addEventListenerSpy,
  }
}

export function renderTransliterationForm(updateEdition: jest.Mock): {
  unmount: () => void
} {
  const { unmount } = render(
    <TransliterationForm
      transliteration={transliteration}
      notes={notes}
      introduction={introduction}
      updateEdition={updateEdition}
    />,
  )
  return { unmount }
}
