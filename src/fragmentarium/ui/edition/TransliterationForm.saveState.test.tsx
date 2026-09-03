import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { submitFormByTestId } from 'test-support/utils'
import { Promise } from 'bluebird'

import TransliterationForm from './TransliterationForm'
import { editorErrorOf, resetEditorMock } from 'editor/Editor.testSupport'

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

const transliteration = 'line1\nline2'
const notes = 'notes'
const introduction = 'introduction'

const editorError = (): unknown => editorErrorOf('transliteration')
const saveButton = (): HTMLElement =>
  screen.getByRole('button', { name: 'Save' })
const transliterationField = (): HTMLElement =>
  screen.getByLabelText('transliteration')

const renderForm = (updateEdition: jest.Mock): void => {
  resetEditorMock()
  render(
    <TransliterationForm
      transliteration={transliteration}
      notes={notes}
      introduction={introduction}
      updateEdition={updateEdition}
    />,
  )
}

const failingUpdate = (error: Error): jest.Mock =>
  jest.fn().mockReturnValue(Promise.reject(error))

it('disables Save after a failed save attempt without further edits', async () => {
  const requestError = new Error('invalid transliteration')
  renderForm(failingUpdate(requestError))

  fireEvent.change(transliterationField(), {
    target: { value: 'line1\nbroken line' },
  })
  expect(saveButton()).toBeEnabled()

  submitFormByTestId(screen, 'transliteration-form')
  await waitFor(() => expect(editorError()).toBe(requestError))

  expect(transliterationField()).toHaveValue('line1\nbroken line')
  expect(saveButton()).toBeDisabled()
})

it('re-enables Save once the transliteration changes after a failed save', async () => {
  renderForm(failingUpdate(new Error('invalid transliteration')))

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

it('disables Save again when reverting to the failed attempt', async () => {
  renderForm(failingUpdate(new Error('invalid transliteration')))

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

it('still warns about unsaved changes after a failed save disables Save', async () => {
  const addEventListenerSpy = jest.spyOn(window, 'addEventListener')
  renderForm(failingUpdate(new Error('invalid transliteration')))

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
    .mockReturnValueOnce(Promise.reject(new Error('invalid transliteration')))
    .mockReturnValueOnce(new Promise(() => undefined))
  renderForm(updateEdition)

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
