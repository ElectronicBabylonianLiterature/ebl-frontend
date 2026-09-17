import React from 'react'
import { render, screen } from '@testing-library/react'
import { Promise } from 'bluebird'

import { editorErrorOf, resetEditorMock } from 'editor/Editor.testSupport'
import TransliterationForm from './TransliterationForm'

export const savedTransliteration = 'line1\nline2'
export const savedNotes = 'notes'
export const savedIntroduction = 'introduction'

export const editorError = (): unknown => editorErrorOf('transliteration')

export const saveButton = (): HTMLElement =>
  screen.getByRole('button', { name: 'Save' })

export const transliterationField = (): HTMLElement =>
  screen.getByLabelText('transliteration')

export const validationError = (
  description = 'invalid transliteration',
): Error =>
  Object.assign(new Error(description), {
    data: { errors: [{ lineNumber: 1, description }] },
  })

export const failingUpdate = (error: Error): jest.Mock =>
  jest.fn().mockReturnValue(Promise.reject(error))

export const renderTransliterationForm = (updateEdition: jest.Mock): void => {
  resetEditorMock()
  render(
    <TransliterationForm
      transliteration={savedTransliteration}
      notes={savedNotes}
      introduction={savedIntroduction}
      updateEdition={updateEdition}
    />,
  )
}
