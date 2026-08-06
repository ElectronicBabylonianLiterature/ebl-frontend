import { fireEvent, screen, waitFor } from '@testing-library/react'
import { submitFormByTestId } from 'test-support/utils'
import userEvent from '@testing-library/user-event'
import { editorState } from 'fragmentarium/ui/edition/TransliterationForm.mocks'
import { renderTransliterationForm } from 'fragmentarium/ui/edition/TransliterationForm.testSupport'

jest.mock(
  'editor/SpecialCharactersHelp',
  () =>
    jest.requireActual('fragmentarium/ui/edition/TransliterationForm.mocks')
      .SpecialCharactersHelpMock,
)

jest.mock(
  'fragmentarium/ui/edition/TemplateForm',
  () =>
    jest.requireActual('fragmentarium/ui/edition/TransliterationForm.mocks')
      .TemplateFormMock,
)

jest.mock(
  'editor/Editor',
  () =>
    jest.requireActual('fragmentarium/ui/edition/TransliterationForm.mocks')
      .EditorMock,
)

beforeEach(() => {
  jest.restoreAllMocks()
  editorState.error = null
})

it('clears error on editor input change', async () => {
  const requestError = new Error('request failed')
  const updateEdition = jest.fn()
  updateEdition.mockReturnValue(Promise.reject(requestError))

  renderTransliterationForm(updateEdition)

  submitFormByTestId(screen, 'transliteration-form')
  await waitFor(() => expect(editorState.error).toBe(requestError))

  fireEvent.change(screen.getByLabelText('transliteration'), {
    target: { value: 'changed transliteration' },
  })

  await waitFor(() => expect(editorState.error).toBeNull())
})

it('clears error on template application', async () => {
  const requestError = new Error('request failed')
  const updateEdition = jest.fn()
  updateEdition.mockReturnValue(Promise.reject(requestError))

  renderTransliterationForm(updateEdition)

  submitFormByTestId(screen, 'transliteration-form')
  await waitFor(() => expect(editorState.error).toBe(requestError))

  await userEvent.click(screen.getByRole('button', { name: 'Apply template' }))

  await waitFor(() => expect(editorState.error).toBeNull())
  expect(screen.getByLabelText('transliteration')).toHaveValue('template value')
})

it('clears error after successful save', async () => {
  const requestError = new Error('request failed')
  const successfulFragment = {
    atf: 'saved transliteration',
    notes: { text: 'saved notes' },
    introduction: { text: 'saved intro' },
  }

  const updateEdition = jest.fn()
  updateEdition
    .mockReturnValueOnce(Promise.reject(requestError))
    .mockReturnValueOnce(Promise.resolve(successfulFragment))

  renderTransliterationForm(updateEdition)

  submitFormByTestId(screen, 'transliteration-form')
  await waitFor(() => expect(editorState.error).toBe(requestError))

  fireEvent.change(screen.getByLabelText('transliteration'), {
    target: { value: 'dirty value' },
  })
  submitFormByTestId(screen, 'transliteration-form')

  await screen.findByDisplayValue('saved transliteration')
  await waitFor(() => expect(editorState.error).toBeNull())
})

it('does not set an error for a cancellation error', async () => {
  const cancellationError = Object.assign(new Error('cancelled'), {
    name: 'CancellationError',
  })

  const updateEdition = jest.fn()
  updateEdition.mockReturnValue(Promise.reject(cancellationError))

  renderTransliterationForm(updateEdition)

  submitFormByTestId(screen, 'transliteration-form')

  await waitFor(() => expect(updateEdition).toHaveBeenCalledWith({}))
  await waitFor(() => expect(editorState.error).toBeNull())
})
