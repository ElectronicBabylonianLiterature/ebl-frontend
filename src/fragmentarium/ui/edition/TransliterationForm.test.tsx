import { fireEvent, screen } from '@testing-library/react'
import { submitFormByTestId } from 'test-support/utils'
import { act } from 'react'
import userEvent from '@testing-library/user-event'
import {
  setUpTransliterationForm,
  TransliterationFormTestContext,
} from 'fragmentarium/ui/edition/TransliterationForm.testSupport'

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

let context: TransliterationFormTestContext

it('Updates transliteration on change', async () => {
  context = setUpTransliterationForm()
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
  context = setUpTransliterationForm()
  await act(async () => {
    submitFormByTestId(screen, 'transliteration-form')
    await Promise.resolve()
  })
  expect(context.updateEdition).toHaveBeenCalledWith({})
})

it('Displays warning before closing when unsaved', async () => {
  context = setUpTransliterationForm()
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

  expect(context.addEventListenerSpy).toHaveBeenCalledWith(
    'beforeunload',
    expect.any(Function),
  )

  const mockEvent = { returnValue: '' }
  const beforeUnloadHandler = context.addEventListenerSpy.mock.calls.find(
    (call) => call[0] === 'beforeunload',
  )?.[1] as (event: { returnValue: string }) => void

  beforeUnloadHandler(mockEvent)

  expect(mockEvent.returnValue).toBe(
    'You have unsaved changes. Are you sure you want to leave?',
  )
})
