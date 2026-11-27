import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChapterOutline } from 'corpus/application/edit-lite/chapterOutline'
import {
  buildEditLiteLines,
  buildEditLiteOutline,
  createFakeChapterEditSource,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import { setLineNumber } from 'corpus/ui/edit-lite/lineDraft'
import {
  button,
  renderEditedContainer,
  renderLoadedContainer,
} from 'corpus/ui/edit-lite/LineEditContainer.testSupport'

jest.mock('editor/Editor', () =>
  jest.requireActual('editor/Editor.testSupport'),
)

const lines = buildEditLiteLines()
const editedLine = setLineNumber(lines[0], '1a')

test('saving sends the draft and shows the saved line', async () => {
  const source = createFakeChapterEditSource({ lines })
  let finishSaving: (outline: ChapterOutline) => void = () => undefined
  source.saveLine.mockImplementationOnce(
    () =>
      new Promise<ChapterOutline>((resolve) => {
        finishSaving = resolve
      }),
  )
  const { getState } = await renderEditedContainer({ source })
  await userEvent.click(button('Save line'))

  expect(screen.getByText('Saving...')).toBeVisible()
  expect(screen.getByLabelText('Number')).toBeDisabled()
  expect(button('Save line')).toBeDisabled()
  expect(button('Reset')).toBeDisabled()
  expect(source.saveLine).toHaveBeenCalledWith(0, lines[0], editedLine)

  source.loadLines.mockResolvedValueOnce([setLineNumber(lines[0], '1A')])
  await act(async () => {
    finishSaving(buildEditLiteOutline([editedLine, ...lines.slice(1)]))
  })

  expect(await screen.findByDisplayValue('1A')).toBeEnabled()
  expect(screen.queryByText('Saving...')).not.toBeInTheDocument()
  expect(button('Save line')).toBeDisabled()
  expect(getState().outline.lines[0].number).toBe('1a')
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})

test('a failed save shows the error and keeps the draft', async () => {
  const source = createFakeChapterEditSource({ lines })
  source.saveLine.mockRejectedValueOnce(new Error('The line has changed.'))
  await renderEditedContainer({ source })
  await userEvent.click(button('Save line'))

  expect(await screen.findByRole('alert')).toHaveTextContent(
    'The line has changed.',
  )
  expect(screen.getByLabelText('Number')).toHaveValue('1a')
  expect(button('Save line')).toBeEnabled()

  await userEvent.type(screen.getByLabelText('Number'), '{Backspace}')

  expect(button('Save line')).toBeDisabled()
  expect(button('Reset')).toBeEnabled()

  await userEvent.click(button('Reset'))

  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  expect(button('Reset')).toBeDisabled()
})

test('a user without write access can read the line but not change it', async () => {
  const { source, getState } = await renderLoadedContainer({
    lines,
    canWrite: false,
  })

  expect(screen.getByLabelText('Number')).toBeDisabled()
  expect(screen.queryByRole('button')).not.toBeInTheDocument()

  await userEvent.click(screen.getByRole('textbox', { name: 'Translation' }))

  expect(
    screen.queryByRole('group', { name: 'Translation' }),
  ).not.toBeInTheDocument()
  expect(getState().lines[0].draft).toBe(lines[0])
  expect(source.saveLine).not.toHaveBeenCalled()
})
