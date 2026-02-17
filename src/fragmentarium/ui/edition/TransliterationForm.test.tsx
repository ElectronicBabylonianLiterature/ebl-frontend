/* eslint-disable react/prop-types */
import React, { act } from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { submitFormByTestId } from 'test-support/utils'
import { Promise } from 'bluebird'

import TransliterationForm from './TransliterationForm'
import userEvent from '@testing-library/user-event'
import { fragmentFactory } from 'test-support/fragment-fixtures'

jest.mock('editor/Editor', () => {
  return function EditorMock({ name, value, onChange, disabled, ...rest }) {
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

const transliteration = 'line1\nline2'
const notes = 'notes'
const introduction = 'introduction'

let addEventListenerSpy
let updateEdition

const setup = () => {
  jest.restoreAllMocks()
  addEventListenerSpy = jest.spyOn(window, 'addEventListener')
  updateEdition = jest.fn()
  updateEdition.mockReturnValue(Promise.resolve())

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
  await act(async () => {
    submitFormByTestId(screen, 'transliteration-form')
    await Promise.resolve()
  })
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

  await act(async () => {
    beforeUnloadHandler(mockEvent)
  })

  expect(mockEvent.returnValue).toBe(
    'You have unsaved changes. Are you sure you want to leave?',
  )
})

it('Clears error on field change', async () => {
  setup()
  updateEdition.mockReturnValueOnce(Promise.reject(new Error('Boom')))
  await act(async () => {
    submitFormByTestId(screen, 'transliteration-form')
    await Promise.resolve()
  })

  await waitFor(() =>
    expect(screen.getByLabelText('transliteration')).toHaveAttribute('error'),
  )

  fireEvent.change(screen.getByLabelText('notes'), {
    target: { value: 'updated notes' },
  })

  await waitFor(() =>
    expect(screen.getByLabelText('transliteration')).not.toHaveAttribute(
      'error',
    ),
  )
})

it('Clears error on template apply', async () => {
  setup()
  updateEdition.mockReturnValueOnce(Promise.reject(new Error('Boom')))
  await act(async () => {
    submitFormByTestId(screen, 'transliteration-form')
    await Promise.resolve()
  })

  await waitFor(() =>
    expect(screen.getByLabelText('transliteration')).toHaveAttribute('error'),
  )

  const templateInput = screen.getByLabelText('Template')
  fireEvent.change(templateInput, { target: { value: '1' } })
  await userEvent.type(templateInput, '{enter}')

  await waitFor(() =>
    expect(screen.getByLabelText('transliteration')).not.toHaveAttribute(
      'error',
    ),
  )
})

it('Clears error after successful save', async () => {
  setup()
  const fragment = fragmentFactory.build({
    atf: 'updated atf',
    notes: {
      text: 'updated notes',
      parts: [{ text: 'updated notes', type: 'StringPart' }],
    },
    introduction: {
      text: 'updated introduction',
      parts: [{ text: 'updated introduction', type: 'StringPart' }],
    },
  })

  updateEdition
    .mockReturnValueOnce(Promise.reject(new Error('Boom')))
    .mockReturnValueOnce(Promise.resolve(fragment))

  await act(async () => {
    submitFormByTestId(screen, 'transliteration-form')
    await Promise.resolve()
  })

  await waitFor(() =>
    expect(screen.getByLabelText('transliteration')).toHaveAttribute('error'),
  )

  await act(async () => {
    submitFormByTestId(screen, 'transliteration-form')
    await Promise.resolve()
  })

  await waitFor(() =>
    expect(screen.getByLabelText('transliteration')).not.toHaveAttribute(
      'error',
    ),
  )
})
