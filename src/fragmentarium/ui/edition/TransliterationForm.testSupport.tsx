import React from 'react'
import { render, RenderResult, screen } from '@testing-library/react'

import { editorErrorOf, resetEditorMock } from 'editor/Editor.testSupport'
import { Fragment } from 'fragmentarium/domain/fragment'
import { EditionFields } from 'fragmentarium/application/FragmentService'
import TransliterationForm from 'fragmentarium/ui/edition/TransliterationForm'
import { ApiError } from 'http/ApiClient'

const savedTransliteration = 'line1\nline2'
const savedNotes = 'notes'
const savedIntroduction = 'introduction'

export type UpdateEditionMock = jest.Mock<Promise<Fragment>, [EditionFields]>

export const editorError = (): unknown => editorErrorOf('transliteration')

export const saveButton = (): HTMLElement =>
  screen.getByRole('button', { name: 'Save' })

export const transliterationField = (): HTMLTextAreaElement =>
  screen.getByLabelText<HTMLTextAreaElement>('transliteration')

export const validationError = (
  description = 'invalid transliteration',
): ApiError =>
  new ApiError(
    description,
    {
      title: '422 Unprocessable Entity',
      description,
      errors: [{ lineNumber: 1, description }],
    },
    422,
  )

export const descriptionOnlyValidationError = (
  description = 'invalid edition',
): ApiError =>
  new ApiError(
    description,
    { title: '422 Unprocessable Entity', description },
    422,
  )

export const httpError = (
  status: number | undefined,
  description: string,
): ApiError =>
  new ApiError(description, { title: String(status), description }, status)

export const createUpdateEditionMock = (): UpdateEditionMock =>
  jest.fn<Promise<Fragment>, [EditionFields]>()

export const failingUpdate = (error: Error): UpdateEditionMock =>
  createUpdateEditionMock().mockImplementation(() => Promise.reject(error))

export const renderTransliterationForm = (
  updateEdition: UpdateEditionMock,
  disabled = false,
): RenderResult => {
  resetEditorMock()
  return render(
    <TransliterationForm
      transliteration={savedTransliteration}
      notes={savedNotes}
      introduction={savedIntroduction}
      updateEdition={updateEdition}
      disabled={disabled}
    />,
  )
}
