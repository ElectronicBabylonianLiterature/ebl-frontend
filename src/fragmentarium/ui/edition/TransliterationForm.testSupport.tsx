import React from 'react'
import { render, RenderResult, screen } from '@testing-library/react'
import { Promise } from 'bluebird'

import { editorErrorOf, resetEditorMock } from 'editor/Editor.testSupport'
import { Fragment } from 'fragmentarium/domain/fragment'
import { EditionFields } from 'fragmentarium/application/FragmentService'
import TransliterationForm from 'fragmentarium/ui/edition/TransliterationForm'
import { ApiError } from 'http/ApiClient'

export const savedTransliteration = 'line1\nline2'
export const savedNotes = 'notes'
export const savedIntroduction = 'introduction'

export type UpdateEditionMock = jest.Mock<Promise<Fragment>, [EditionFields]>

export const editorError = (): unknown => editorErrorOf('transliteration')

export const saveButton = (): HTMLElement =>
  screen.getByRole('button', { name: 'Save' })

export const transliterationField = (): HTMLTextAreaElement =>
  screen.getByLabelText<HTMLTextAreaElement>('transliteration')

export const annotatedValidationError = (
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

export const validationError = annotatedValidationError

export const createUpdateEditionMock = (): UpdateEditionMock =>
  jest.fn<Promise<Fragment>, [EditionFields]>()

export const failingUpdate = (error: Error): UpdateEditionMock =>
  createUpdateEditionMock().mockReturnValue(Promise.reject(error))

export const renderTransliterationForm = (
  updateEdition: UpdateEditionMock,
): RenderResult => {
  resetEditorMock()
  return render(
    <TransliterationForm
      transliteration={savedTransliteration}
      notes={savedNotes}
      introduction={savedIntroduction}
      updateEdition={updateEdition}
    />,
  )
}
