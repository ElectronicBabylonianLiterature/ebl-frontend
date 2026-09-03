import React from 'react'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { submitFormByTestId } from 'test-support/utils'
import { Promise } from 'bluebird'

import {
  editorError,
  failingUpdate,
  renderTransliterationForm,
  saveButton,
  transliterationField,
  validationError,
} from './TransliterationForm.testSupport'

jest.mock('editor/SpecialCharactersHelp', () => {
  return function SpecialCharactersHelpMock() {
    return null
  }
})

jest.mock('./TemplateForm', () => {
  return function TemplateFormMock(): JSX.Element {
    return <span />
  }
})

jest.mock('editor/Editor', () =>
  jest.requireActual('editor/Editor.testSupport'),
)

it('disables Save after a failed validation attempt without further edits', async () => {
  const requestError = validationError()
  renderTransliterationForm(failingUpdate(requestError))

  fireEvent.change(transliterationField(), {
    target: { value: 'line1\nbroken line' },
  })
  expect(saveButton()).toBeEnabled()

  submitFormByTestId(screen, 'transliteration-form')
  await waitFor(() => expect(editorError()).toBe(requestError))

  expect(transliterationField()).toHaveValue('line1\nbroken line')
  expect(saveButton()).toBeDisabled()
})

it('re-enables Save once the transliteration changes after a failed validation', async () => {
  renderTransliterationForm(failingUpdate(validationError()))

  fireEvent.change(transliterationField(), {
    target: { value: 'line1\nbroken line' },
  })
  submitFormByTestId(screen, 'transliteration-form')
  await waitFor(() => expect(saveButton()).toBeDisabled())

  fireEvent.change(transliterationField(), {
    target: { value: 'line1\nfixed line' },
  })
  expect(saveButton()).toBeEnabled()
})

it('disables Save again when reverting to the failed validation attempt', async () => {
  renderTransliterationForm(failingUpdate(validationError()))

  fireEvent.change(transliterationField(), {
    target: { value: 'line1\nbroken line' },
  })
  submitFormByTestId(screen, 'transliteration-form')
  await waitFor(() => expect(saveButton()).toBeDisabled())

  fireEvent.change(transliterationField(), {
    target: { value: 'line1\nfixed line' },
  })
  expect(saveButton()).toBeEnabled()

  fireEvent.change(transliterationField(), {
    target: { value: 'line1\nbroken line' },
  })
  expect(saveButton()).toBeDisabled()
})

it('keeps Save enabled after a non-validation failure so it can be retried', async () => {
  const transientError = new Error('service unavailable')
  const updateEdition = jest
    .fn()
    .mockReturnValueOnce(Promise.reject(transientError))
    .mockReturnValueOnce(new Promise(() => undefined))
  renderTransliterationForm(updateEdition)

  fireEvent.change(transliterationField(), {
    target: { value: 'line1\nline2\nline3' },
  })
  submitFormByTestId(screen, 'transliteration-form')
  await waitFor(() => expect(editorError()).toBe(transientError))

  expect(saveButton()).toBeEnabled()

  submitFormByTestId(screen, 'transliteration-form')
  await waitFor(() => expect(updateEdition).toHaveBeenCalledTimes(2))
})

it('still warns about unsaved changes after a failed validation disables Save', async () => {
  const addEventListenerSpy = jest.spyOn(window, 'addEventListener')
  renderTransliterationForm(failingUpdate(validationError()))

  fireEvent.change(transliterationField(), {
    target: { value: 'line1\nbroken line' },
  })
  submitFormByTestId(screen, 'transliteration-form')
  await waitFor(() => expect(saveButton()).toBeDisabled())

  const beforeUnloadCall = addEventListenerSpy.mock.calls.find(
    (call) => call[0] === 'beforeunload',
  )
  const beforeUnloadHandler = beforeUnloadCall?.[1] as unknown as (event: {
    returnValue: string
  }) => void
  const mockEvent = { returnValue: '' }
  beforeUnloadHandler(mockEvent)

  expect(mockEvent.returnValue).toBe(
    'You have unsaved changes. Are you sure you want to leave?',
  )
  addEventListenerSpy.mockRestore()
})

it('sends every field still differing from the saved version when retrying', async () => {
  const updateEdition = jest
    .fn()
    .mockReturnValueOnce(Promise.reject(validationError()))
    .mockReturnValueOnce(new Promise(() => undefined))
  renderTransliterationForm(updateEdition)

  fireEvent.change(transliterationField(), {
    target: { value: 'broken atf' },
  })
  fireEvent.change(screen.getByLabelText('notes'), {
    target: { value: 'updated notes' },
  })
  submitFormByTestId(screen, 'transliteration-form')
  await waitFor(() =>
    expect(updateEdition).toHaveBeenNthCalledWith(1, {
      transliteration: 'broken atf',
      notes: 'updated notes',
    }),
  )

  fireEvent.change(transliterationField(), {
    target: { value: 'fixed atf' },
  })
  submitFormByTestId(screen, 'transliteration-form')
  await waitFor(() =>
    expect(updateEdition).toHaveBeenNthCalledWith(2, {
      transliteration: 'fixed atf',
      notes: 'updated notes',
    }),
  )
})
