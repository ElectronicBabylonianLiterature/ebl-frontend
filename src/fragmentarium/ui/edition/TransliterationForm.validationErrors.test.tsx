import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Promise } from 'bluebird'

import { editorErrorOf, resetEditorMock } from 'editor/Editor.testSupport'
import { submitFormByTestId } from 'test-support/utils'
import TransliterationForm from './TransliterationForm'

type TemplateFormMockProps = {
  onSubmit: (templateValue: string) => void
}

jest.mock('editor/SpecialCharactersHelp', () => {
  return function SpecialCharactersHelpMock() {
    return null
  }
})

jest.mock('./TemplateForm', () => {
  return function TemplateFormMock({
    onSubmit,
  }: TemplateFormMockProps): JSX.Element {
    return (
      <button onClick={() => onSubmit('template value')} type="button">
        Apply template
      </button>
    )
  }
})

jest.mock('editor/Editor', () =>
  jest.requireActual('editor/Editor.testSupport'),
)

const editorError = (): unknown => editorErrorOf('transliteration')

function validationError(description: string): Error {
  return Object.assign(new Error(description), {
    data: { errors: [{ lineNumber: 1, description }] },
  })
}

function renderForm(updateEdition: jest.Mock): void {
  render(
    <TransliterationForm
      transliteration={'line1\nline2'}
      notes={'notes'}
      introduction={'introduction'}
      updateEdition={updateEdition}
    />,
  )
}

beforeEach(() => {
  resetEditorMock()
})

it('replaces a visible validation error with the next save error', async () => {
  const firstError = validationError('first validation error')
  const secondError = validationError('second validation error')
  const updateEdition = jest
    .fn()
    .mockImplementationOnce(() => Promise.reject(firstError))
    .mockImplementationOnce(() => Promise.reject(secondError))

  renderForm(updateEdition)

  submitFormByTestId(screen, 'transliteration-form')
  await waitFor(() => expect(editorError()).toBe(firstError))

  fireEvent.change(screen.getByLabelText('transliteration'), {
    target: { value: 'changed transliteration' },
  })
  await waitFor(() => expect(editorError()).toBe(firstError))

  submitFormByTestId(screen, 'transliteration-form')

  await waitFor(() => expect(editorError()).toBe(secondError))
})
