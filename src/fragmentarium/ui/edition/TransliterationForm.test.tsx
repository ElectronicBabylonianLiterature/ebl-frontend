import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { submitFormByTestId } from 'test-support/utils'
import { Promise } from 'bluebird'

import TransliterationForm from './TransliterationForm'
import { act } from 'react-dom/test-utils'
import userEvent from '@testing-library/user-event'

const transliteration = 'line1\nline2'
const notes = 'notes'
const introduction = 'introduction'

let addEventListenerSpy
let updateEdition

beforeEach(async () => {
  jest.restoreAllMocks()
  addEventListenerSpy = jest.spyOn(window, 'addEventListener')
  updateEdition = jest.fn()
  updateEdition.mockReturnValue(Promise.resolve())

  act(() => {
    render(
      <TransliterationForm
        transliteration={transliteration}
        notes={notes}
        introduction={introduction}
        updateEdition={updateEdition}
      />
    )
  })
})

it('Updates transliteration on change', async () => {
  const newTransliteration = 'line1\nline2\nnew line'
  const transliterationEditor = screen.getAllByRole('textbox')[0]
  fireEvent.click(transliterationEditor)
  await userEvent.click(transliterationEditor)
  await userEvent.paste(transliterationEditor, newTransliteration)
  act(() => {
    fireEvent.change(transliterationEditor, {
      target: { value: newTransliteration },
    })
  })
  expect(transliterationEditor).toHaveValue(newTransliteration)
})

it('calls updateEdition when submitting the form', () => {
  submitFormByTestId(screen, 'transliteration-form')
  expect(updateEdition).toHaveBeenCalledWith({})
})

it('Displays warning before closing when unsaved', async () => {
  const newTransliteration = 'line1\nline2\nnew line'
  window.confirm = jest.fn(() => true)
  const beforeUnloadEvent = new Event('beforeunload', { cancelable: true })
  const transliterationEditor = screen.getAllByRole('textbox')[0]
  fireEvent.click(transliterationEditor)
  await userEvent.click(transliterationEditor)
  await userEvent.paste(transliterationEditor, newTransliteration)
  act(() => {
    fireEvent.change(transliterationEditor, {
      target: { value: newTransliteration },
    })
  })
  expect(transliterationEditor).toHaveValue(newTransliteration)
  window.dispatchEvent(beforeUnloadEvent)
  expect(addEventListenerSpy).toHaveBeenCalledWith(
    'beforeunload',
    expect.any(Function)
  )
  const mockEvent = { returnValue: '' }
  const beforeUnloadHandler = addEventListenerSpy.mock.calls.find(
    (call) => call[0] === 'beforeunload'
  )[1]
  beforeUnloadHandler(mockEvent)
  expect(mockEvent.returnValue).toBe(
    'You have unsaved changes. Are you sure you want to leave?'
  )
})
