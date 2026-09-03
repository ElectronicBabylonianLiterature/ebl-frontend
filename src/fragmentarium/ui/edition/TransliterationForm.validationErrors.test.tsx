import React from 'react'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { Promise } from 'bluebird'

import { submitFormByTestId } from 'test-support/utils'
import {
  editorError,
  renderTransliterationForm,
  validationError,
} from './TransliterationForm.testSupport'

jest.mock('editor/SpecialCharactersHelp', () => {
  return function SpecialCharactersHelpMock() {
    return null
  }
})

jest.mock('fragmentarium/ui/edition/TemplateForm', () => {
  return function TemplateFormMock(): JSX.Element {
    return <span />
  }
})

jest.mock('editor/Editor', () =>
  jest.requireActual('editor/Editor.testSupport'),
)

it('replaces a visible validation error with the next save error', async () => {
  const firstError = validationError('first validation error')
  const secondError = validationError('second validation error')
  const updateEdition = jest
    .fn()
    .mockImplementationOnce(() => Promise.reject(firstError))
    .mockImplementationOnce(() => Promise.reject(secondError))

  renderTransliterationForm(updateEdition)

  submitFormByTestId(screen, 'transliteration-form')
  await waitFor(() => expect(editorError()).toBe(firstError))

  fireEvent.change(screen.getByLabelText('transliteration'), {
    target: { value: 'changed transliteration' },
  })
  await waitFor(() => expect(editorError()).toBe(firstError))

  submitFormByTestId(screen, 'transliteration-form')

  await waitFor(() => expect(editorError()).toBe(secondError))
})
