/* eslint-disable react/prop-types */
import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { submitFormByTestId } from 'test-support/utils'
import { Promise } from 'bluebird'

import TransliterationForm from './TransliterationForm'
import userEvent from '@testing-library/user-event'

jest.mock('editor/SpecialCharactersHelp', () => {
  return function SpecialCharactersHelpMock() {
    return null
  }
})

jest.mock('./TemplateForm', () => {
  return function TemplateFormMock({ onSubmit }) {
    return (
      <button onClick={() => onSubmit('template value')} type="button">
        Apply template
      </button>
    )
  }
})

jest.mock('editor/Editor', () => {
  return function EditorMock({ name, value, onChange, disabled, ...rest }) {
    if (name === 'transliteration') {
      editorError = rest.error ?? null
    }
    return (
      <textarea
        aria-label={name}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        {...rest}
      />
    )
  }
})

let editorError

const transliteration = 'line1\nline2'
const notes = 'notes'
const introduction = 'introduction'

let addEventListenerSpy
let updateEdition

const setup = () => {
  jest.restoreAllMocks()
  editorError = null
  addEventListenerSpy = jest.spyOn(window, 'addEventListener')
  updateEdition = jest.fn()
  updateEdition.mockReturnValue(new Promise(() => undefined))

  render(
    <TransliterationForm
      transliteration={transliteration}
      notes={notes}
      introduction={introduction}
      updateEdition={updateEdition}
    />,
  )
}

it('Updates transliteration on change', async () => {
  setup()
  const newTransliteration = 'line1\nline2\nnew line'
  const transliterationEditor = screen.getAllByRole('textbox')[0]

  fireEvent.click(transliterationEditor)
  await userEvent.click(transliterationEditor)
  await userEvent.type(transliterationEditor, newTransliteration)
  fireEvent.change(transliterationEditor, {
    target: { value: newTransliteration },
  })

  expect(transliterationEditor).toHaveValue(newTransliteration)
})

it('calls updateEdition when submitting the form', async () => {
  setup()
  submitFormByTestId(screen, 'transliteration-form')
  expect(updateEdition).toHaveBeenCalledWith({})
})

it('Displays warning before closing when unsaved', async () => {
  setup()
  const newTransliteration = 'line1\nline2\nnew line'
  window.confirm = jest.fn(() => true)
  const beforeUnloadEvent = new Event('beforeunload', { cancelable: true })
  const transliterationEditor = screen.getAllByRole('textbox')[0]

  fireEvent.click(transliterationEditor)
  await userEvent.click(transliterationEditor)
  await userEvent.type(transliterationEditor, newTransliteration)
  fireEvent.change(transliterationEditor, {
    target: { value: newTransliteration },
  })

  expect(transliterationEditor).toHaveValue(newTransliteration)

  window.dispatchEvent(beforeUnloadEvent)

  expect(addEventListenerSpy).toHaveBeenCalledWith(
    'beforeunload',
    expect.any(Function),
  )

  const mockEvent = { returnValue: '' }
  const beforeUnloadHandler = addEventListenerSpy.mock.calls.find(
    (call) => call[0] === 'beforeunload',
  )[1]

  beforeUnloadHandler(mockEvent)

  expect(mockEvent.returnValue).toBe(
    'You have unsaved changes. Are you sure you want to leave?',
  )
})

it('clears error on editor input change', async () => {
  const requestError = new Error('request failed')
  updateEdition = jest.fn()
  updateEdition.mockReturnValue(Promise.reject(requestError))

  render(
    <TransliterationForm
      transliteration={transliteration}
      notes={notes}
      introduction={introduction}
      updateEdition={updateEdition}
    />,
  )

  submitFormByTestId(screen, 'transliteration-form')
  await waitFor(() => expect(editorError).toBe(requestError))

  fireEvent.change(screen.getByLabelText('transliteration'), {
    target: { value: 'changed transliteration' },
  })

  await waitFor(() => expect(editorError).toBeNull())
})

it('clears error on template application', async () => {
  const requestError = new Error('request failed')
  updateEdition = jest.fn()
  updateEdition.mockReturnValue(Promise.reject(requestError))

  render(
    <TransliterationForm
      transliteration={transliteration}
      notes={notes}
      introduction={introduction}
      updateEdition={updateEdition}
    />,
  )

  submitFormByTestId(screen, 'transliteration-form')
  await waitFor(() => expect(editorError).toBe(requestError))

  await userEvent.click(screen.getByRole('button', { name: 'Apply template' }))

  await waitFor(() => expect(editorError).toBeNull())
  expect(screen.getByLabelText('transliteration')).toHaveValue('template value')
})

it('clears error after successful save', async () => {
  const requestError = new Error('request failed')
  const successfulFragment = {
    atf: 'saved transliteration',
    notes: { text: 'saved notes' },
    introduction: { text: 'saved intro' },
  }

  updateEdition = jest.fn()
  updateEdition
    .mockReturnValueOnce(Promise.reject(requestError))
    .mockReturnValueOnce(Promise.resolve(successfulFragment))

  render(
    <TransliterationForm
      transliteration={transliteration}
      notes={notes}
      introduction={introduction}
      updateEdition={updateEdition}
    />,
  )

  submitFormByTestId(screen, 'transliteration-form')
  await waitFor(() => expect(editorError).toBe(requestError))

  fireEvent.change(screen.getByLabelText('transliteration'), {
    target: { value: 'dirty value' },
  })
  submitFormByTestId(screen, 'transliteration-form')

  await screen.findByDisplayValue('saved transliteration')
  await waitFor(() => expect(editorError).toBeNull())
})
