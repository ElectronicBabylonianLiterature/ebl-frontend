import React from 'react'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { Promise } from 'bluebird'

import { submitFormByTestId } from 'test-support/utils'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { Fragment } from 'fragmentarium/domain/fragment'
import {
  createUpdateEditionMock,
  descriptionOnlyValidationError,
  editorError,
  failingUpdate,
  httpError,
  renderTransliterationForm,
  saveButton,
  transliterationField,
  validationError,
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

afterEach(() => jest.restoreAllMocks())

function editTransliteration(value: string): void {
  fireEvent.change(transliterationField(), { target: { value } })
}

function submitTransliteration(): void {
  submitFormByTestId(screen, 'transliteration-form')
}

it('disables Save after a description-only 422 response', async () => {
  const requestError = descriptionOnlyValidationError()
  renderTransliterationForm(failingUpdate(requestError))

  editTransliteration('line1\nbroken line')
  submitTransliteration()

  await waitFor(() => expect(editorError()).toBe(requestError))
  expect(saveButton()).toBeDisabled()
})

it('disables Save after a deterministic 403 response', async () => {
  const requestError = httpError(403, 'Forbidden')
  renderTransliterationForm(failingUpdate(requestError))

  editTransliteration('line1\nbroken line')
  submitTransliteration()

  await waitFor(() => expect(editorError()).toBe(requestError))
  expect(saveButton()).toBeDisabled()
})

it('records a rejection after editing while the save is pending', async () => {
  let rejectUpdate!: (reason?: unknown) => void
  const pendingUpdate = new Promise<Fragment>((_resolve, reject) => {
    rejectUpdate = reject
  })
  const updateEdition = createUpdateEditionMock().mockReturnValue(pendingUpdate)
  renderTransliterationForm(updateEdition)

  editTransliteration('B')
  submitTransliteration()
  await waitFor(() => expect(updateEdition).toHaveBeenCalledTimes(1))

  fireEvent.click(screen.getByRole('button', { name: 'Apply template' }))
  expect(transliterationField()).toHaveValue('template value')

  rejectUpdate(descriptionOnlyValidationError('B rejected'))
  await waitFor(() => expect(editorError()).not.toBeNull())

  editTransliteration('B')
  expect(saveButton()).toBeDisabled()
})

it.each([
  ['network error', new Error('network error')],
  ['408 response', httpError(408, 'Request Timeout')],
  ['statusless API response', httpError(undefined, 'Unknown response')],
  ['399 response', httpError(399, 'Unexpected response')],
  ['429 response', httpError(429, 'Too Many Requests')],
  ['500 response', httpError(500, 'Internal Server Error')],
])('keeps Save enabled after a retryable %s', async (_label, requestError) => {
  renderTransliterationForm(failingUpdate(requestError))

  editTransliteration('line1\nchanged line')
  submitTransliteration()

  await waitFor(() => expect(editorError()).toBe(requestError))
  expect(saveButton()).toBeEnabled()
})

it('remembers every rejected snapshot', async () => {
  const updateEdition = createUpdateEditionMock()
    .mockReturnValueOnce(Promise.reject(validationError('B rejected')))
    .mockReturnValueOnce(Promise.reject(validationError('C rejected')))
  renderTransliterationForm(updateEdition)

  editTransliteration('B')
  submitTransliteration()
  await waitFor(() => expect(saveButton()).toBeDisabled())

  editTransliteration('C')
  submitTransliteration()
  await waitFor(() => expect(updateEdition).toHaveBeenCalledTimes(2))
  await waitFor(() => expect(saveButton()).toBeDisabled())

  editTransliteration('B')
  expect(saveButton()).toBeDisabled()
})

it('allows a rejected snapshot to be retried after window focus', async () => {
  renderTransliterationForm(failingUpdate(validationError()))

  editTransliteration('line1\nbroken line')
  submitTransliteration()
  await waitFor(() => expect(saveButton()).toBeDisabled())

  fireEvent(window, new Event('focus'))

  expect(saveButton()).toBeEnabled()
})

it('clears rejected snapshots after a successful save', async () => {
  const successfulFragment = fragmentFactory.build({
    atf: 'C',
    notes: { text: 'notes', parts: [] },
    introduction: { text: 'introduction', parts: [] },
  })
  const updateEdition = createUpdateEditionMock()
    .mockReturnValueOnce(Promise.reject(validationError('B rejected')))
    .mockReturnValueOnce(Promise.resolve(successfulFragment))
  renderTransliterationForm(updateEdition)

  editTransliteration('B')
  submitTransliteration()
  await waitFor(() => expect(saveButton()).toBeDisabled())

  editTransliteration('C')
  submitTransliteration()
  await waitFor(() => expect(transliterationField()).toHaveValue('C'))

  editTransliteration('B')
  expect(saveButton()).toBeEnabled()
})

it('keeps form identifiers stable after an edit', () => {
  renderTransliterationForm(
    createUpdateEditionMock().mockReturnValue(new Promise(() => undefined)),
  )
  const form = screen.getByTestId('transliteration-form')
  const formId = form.id
  expect(formId).not.toBe('')
  expect(saveButton()).toHaveAttribute('form', formId)

  editTransliteration('changed transliteration')

  expect(screen.getByTestId('transliteration-form')).toHaveAttribute(
    'id',
    formId,
  )
  expect(saveButton()).toHaveAttribute('form', formId)
})
