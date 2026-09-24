import React from 'react'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { submitFormByTestId } from 'test-support/utils'
import { Promise } from 'bluebird'
import { act } from 'react'
import userEvent from '@testing-library/user-event'
import { fragmentFactory } from 'test-support/fragment-fixtures'

import {
  createUpdateEditionMock,
  editorError,
  renderTransliterationForm,
  UpdateEditionMock,
} from 'fragmentarium/ui/edition/TransliterationForm.testSupport'

type TemplateFormMockProps = {
  onSubmit: (templateValue: string) => void
}

jest.mock('editor/SpecialCharactersHelp', () => {
  return function SpecialCharactersHelpMock() {
    return null
  }
})

jest.mock('fragmentarium/ui/edition/TemplateForm', () => {
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

let addEventListenerSpy: jest.SpyInstance
let removeEventListenerSpy: jest.SpyInstance
let updateEdition: UpdateEditionMock

const setup = () => {
  addEventListenerSpy = jest.spyOn(window, 'addEventListener')
  removeEventListenerSpy = jest.spyOn(window, 'removeEventListener')
  updateEdition = createUpdateEditionMock()
  updateEdition.mockReturnValue(new Promise(() => undefined))

  renderTransliterationForm(updateEdition)
}

afterEach(() => jest.restoreAllMocks())

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

it('does not warn before closing a pristine form', () => {
  setup()
  const listener = removeEventListenerSpy.mock.calls.find(
    ([eventName]) => eventName === 'beforeunload',
  )?.[1]
  if (typeof listener !== 'function') {
    throw new Error('beforeunload listener was not registered for removal')
  }
  const event = new Event('beforeunload') as BeforeUnloadEvent
  const setReturnValue = jest.fn()
  Object.defineProperty(event, 'returnValue', { set: setReturnValue })

  listener(event)

  expect(setReturnValue).not.toHaveBeenCalled()
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

it('keeps error on editor input change', async () => {
  const requestError = new Error('request failed')
  updateEdition = createUpdateEditionMock()
  updateEdition.mockReturnValue(Promise.reject(requestError))

  renderTransliterationForm(updateEdition)

  submitFormByTestId(screen, 'transliteration-form')
  await waitFor(() => expect(editorError()).toBe(requestError))

  fireEvent.change(screen.getByLabelText('transliteration'), {
    target: { value: 'changed transliteration' },
  })

  await waitFor(() => expect(editorError()).toBe(requestError))
})

it('keeps error on template application', async () => {
  const requestError = new Error('request failed')
  updateEdition = createUpdateEditionMock()
  updateEdition.mockReturnValue(Promise.reject(requestError))

  renderTransliterationForm(updateEdition)

  submitFormByTestId(screen, 'transliteration-form')
  await waitFor(() => expect(editorError()).toBe(requestError))

  await userEvent.click(screen.getByRole('button', { name: 'Apply template' }))

  await waitFor(() => expect(editorError()).toBe(requestError))
  expect(screen.getByLabelText('transliteration')).toHaveValue('template value')
})

it('clears error after successful save', async () => {
  const requestError = new Error('request failed')
  const successfulFragment = fragmentFactory.build({
    atf: 'saved transliteration',
    notes: { text: 'saved notes', parts: [] },
    introduction: { text: 'saved intro', parts: [] },
  })

  updateEdition = createUpdateEditionMock()
  updateEdition
    .mockReturnValueOnce(Promise.reject(requestError))
    .mockReturnValueOnce(Promise.resolve(successfulFragment))

  renderTransliterationForm(updateEdition)

  submitFormByTestId(screen, 'transliteration-form')
  await waitFor(() => expect(editorError()).toBe(requestError))

  fireEvent.change(screen.getByLabelText('transliteration'), {
    target: { value: 'dirty value' },
  })
  await waitFor(() => expect(editorError()).toBe(requestError))
  submitFormByTestId(screen, 'transliteration-form')

  await screen.findByDisplayValue('saved transliteration')
  await waitFor(() => expect(editorError()).toBeNull())
})

it('does not set an error for a cancellation error', async () => {
  const cancellationError = Object.assign(new Error('cancelled'), {
    name: 'CancellationError',
  })

  updateEdition = createUpdateEditionMock()
  updateEdition.mockReturnValue(Promise.reject(cancellationError))

  renderTransliterationForm(updateEdition)

  submitFormByTestId(screen, 'transliteration-form')

  await waitFor(() => expect(updateEdition).toHaveBeenCalledWith({}))
  await waitFor(() => expect(editorError()).toBeNull())
})

it('does not set an error when the promise reports cancellation', async () => {
  const requestError = new Error('request failed')
  const cancelledPromise = {
    then: jest.fn(),
    catch: jest.fn(),
    isCancelled: jest.fn(() => true),
    cancel: jest.fn(),
  }
  cancelledPromise.then.mockReturnValue(cancelledPromise)
  cancelledPromise.catch.mockImplementation((onRejected) => {
    queueMicrotask(() => onRejected(requestError))
    return cancelledPromise
  })

  updateEdition = createUpdateEditionMock()
  updateEdition.mockReturnValue(cancelledPromise as unknown as Promise<never>)

  renderTransliterationForm(updateEdition)

  submitFormByTestId(screen, 'transliteration-form')

  await waitFor(() => expect(updateEdition).toHaveBeenCalledWith({}))
  await waitFor(() => expect(cancelledPromise.isCancelled).toHaveBeenCalled())
  await waitFor(() => expect(editorError()).toBeNull())
})
