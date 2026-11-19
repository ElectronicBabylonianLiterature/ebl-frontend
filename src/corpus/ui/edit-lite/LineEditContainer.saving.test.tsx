import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toLineEditsDto } from 'corpus/application/edit-lite/lineEdits'
import { ChapterOutline } from 'corpus/application/edit-lite/chapterOutline'
import { dryRunNotice } from 'corpus/ui/edit-lite/DryRunModal'
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

function expectDryRun(): void {
  const dialog = within(screen.getByRole('dialog'))
  expect(dialog.getByText(dryRunNotice)).toBeVisible()
  expect(dialog.getByLabelText('Request body')).toHaveTextContent(
    JSON.stringify(toLineEditsDto(0, editedLine), null, 2),
    { normalizeWhitespace: false },
  )
}

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

test('a read-only source previews the request instead of saving', async () => {
  const { source } = await renderEditedContainer({ kind: 'legacy' })

  expect(
    screen.getByText(/Read-only data source: saving is a dry run/),
  ).toBeVisible()

  await userEvent.click(button('Save line'))

  expectDryRun()
  expect(source.saveLine).not.toHaveBeenCalled()

  await userEvent.click(
    within(screen.getByRole('dialog')).getByText('Close', {
      selector: '.btn',
    }),
  )

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(screen.getByLabelText('Number')).toHaveValue('1a')
})

test('a user without write access is told that saving is a dry run', async () => {
  const { source } = await renderEditedContainer({ canSave: false })

  expect(screen.getByText(/You are not allowed to save texts/)).toBeVisible()

  await userEvent.click(button('Save line'))

  expectDryRun()
  expect(source.saveLine).not.toHaveBeenCalled()
})

test('the request can be previewed at any time', async () => {
  const { source } = await renderLoadedContainer({ lines })
  await userEvent.click(button('Preview request'))

  expect(
    within(screen.getByRole('dialog')).getByLabelText('Request body'),
  ).toHaveTextContent(JSON.stringify(toLineEditsDto(0, lines[0]), null, 2), {
    normalizeWhitespace: false,
  })
  expect(source.describeSave).toHaveBeenCalledWith(0, lines[0])
  expect(source.saveLine).not.toHaveBeenCalled()
})
