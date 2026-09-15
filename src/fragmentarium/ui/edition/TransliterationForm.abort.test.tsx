import { screen, waitFor } from '@testing-library/react'
import { submitFormByTestId } from 'test-support/utils'
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

it('does not apply the saved fragment when the request is aborted', async () => {
  let resolveEdition: (fragment: unknown) => void = () => undefined
  const updateEdition = jest.fn().mockReturnValue(
    new Promise((resolve) => {
      resolveEdition = resolve
    }),
  )

  const { unmount } = renderTransliterationForm(updateEdition)

  submitFormByTestId(screen, 'transliteration-form')
  await waitFor(() => expect(updateEdition).toHaveBeenCalledWith({}))

  unmount()
  resolveEdition({
    atf: 'saved transliteration',
    notes: { text: 'saved notes' },
    introduction: { text: 'saved intro' },
  })
  await new Promise((resolve) => setTimeout(resolve, 0))

  expect(
    screen.queryByDisplayValue('saved transliteration'),
  ).not.toBeInTheDocument()
})

it('does not set an error when the request is aborted', async () => {
  const requestError = new Error('request failed')
  let rejectEdition: (error: Error) => void = () => undefined
  const updateEdition = jest.fn().mockReturnValue(
    new Promise<never>((_resolve, reject) => {
      rejectEdition = reject
    }),
  )

  const { unmount } = renderTransliterationForm(updateEdition)

  submitFormByTestId(screen, 'transliteration-form')
  await waitFor(() => expect(updateEdition).toHaveBeenCalledWith({}))

  unmount()
  rejectEdition(requestError)
  await new Promise((resolve) => setTimeout(resolve, 0))

  expect(editorState.error).toBeNull()
})
