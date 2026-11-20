import { act, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toDeletedLineDto } from 'corpus/application/edit-lite/lineEdits'
import { Line } from 'corpus/domain/line'
import {
  buildEditLiteLines,
  createFakeChapterEditSource,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import {
  button,
  renderEditedContainer,
  renderLoadedContainer,
} from 'corpus/ui/edit-lite/LineEditContainer.testSupport'
import { deleteDryRunNotice } from 'corpus/ui/edit-lite/LineEditToolbar'
import { holdNextCall } from 'corpus/ui/edit-lite/useEditLite.testSupport'

jest.mock('editor/Editor', () =>
  jest.requireActual('editor/Editor.testSupport'),
)

const lines: readonly Line[] = buildEditLiteLines()

function confirmation(): HTMLElement {
  return screen.getByRole('dialog', { name: 'Delete line' })
}

async function expectLoadedLine(lineNumber: string): Promise<void> {
  await waitFor(() =>
    expect(screen.getByLabelText('Number')).toHaveValue(lineNumber),
  )
  expect(screen.getByLabelText('Number')).toBeEnabled()
}

async function confirmDeletion(): Promise<void> {
  await userEvent.click(button('Delete line'))
  await userEvent.click(
    within(confirmation()).getByRole('button', { name: 'Delete line' }),
  )
}

test('Delete line asks before anything is sent', async () => {
  const { source } = await renderLoadedContainer({ lines })
  await userEvent.click(button('Delete line'))

  expect(confirmation()).toHaveTextContent('Delete line 1 from the chapter?')
  expect(confirmation()).toHaveTextContent('This cannot be undone.')
  expect(source.deleteLine).not.toHaveBeenCalled()
})

test('cancelling keeps the line and its draft', async () => {
  const { source, getState } = await renderEditedContainer({ lines })
  await userEvent.click(button('Delete line'))
  await userEvent.click(
    within(confirmation()).getByRole('button', { name: 'Cancel' }),
  )

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(source.deleteLine).not.toHaveBeenCalled()
  expect(screen.getByLabelText('Number')).toHaveValue('1a')
  expect(getState().lines[0].status).toBe('ready')
})

test('confirming deletes the line and shows the progress', async () => {
  const source = createFakeChapterEditSource({ lines })
  const held = holdNextCall(source.deleteLine)
  const { getState } = await renderLoadedContainer({ source })
  await confirmDeletion()

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(source.deleteLine.mock.calls).toEqual([[0]])
  expect(screen.getByText('Deleting...')).toBeVisible()
  expect(screen.getByLabelText('Number')).toBeDisabled()
  expect(button('Delete line')).toBeDisabled()
  expect(button('Save line')).toBeDisabled()
  expect(button('Reset')).toBeDisabled()

  await act(async () => held.resolve())

  expect(getState().outline.lines.map((line) => line.number)).toEqual([
    '2',
    '3',
  ])
  await expectLoadedLine('2')
  expect(screen.queryByText('Deleting...')).not.toBeInTheDocument()
})

test('a failed deletion shows the error next to the line and can be repeated', async () => {
  const source = createFakeChapterEditSource({ lines })
  source.deleteLine.mockRejectedValueOnce(
    new Error('The chapter was changed by someone else.'),
  )
  const { getState } = await renderLoadedContainer({ source })
  await confirmDeletion()

  expect(await screen.findByRole('alert')).toHaveTextContent(
    'The chapter was changed by someone else.',
  )
  expect(getState().outline.lines).toHaveLength(3)
  expect(button('Delete line')).toBeEnabled()

  await confirmDeletion()

  await expectLoadedLine('2')
  expect(source.deleteLine).toHaveBeenCalledTimes(2)
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})

test('a read-only source previews the deletion instead of sending it', async () => {
  const { source } = await renderLoadedContainer({ kind: 'legacy', lines })
  await confirmDeletion()
  const dialog = within(screen.getByRole('dialog', { name: 'Request preview' }))

  expect(dialog.getByText(deleteDryRunNotice)).toBeVisible()
  expect(deleteDryRunNotice).toContain('nothing was sent')
  expect(
    dialog.getByText(
      'POST /texts/L/1/2/chapters/Standard%20Babylonian/I/lines?view=outline&revision=revision-1',
    ),
  ).toBeVisible()
  expect(dialog.getByLabelText('Request body')).toHaveTextContent(
    JSON.stringify(toDeletedLineDto(0), null, 2),
    { normalizeWhitespace: false },
  )
  expect(source.describeChange).toHaveBeenCalledWith({
    type: 'deleteLine',
    index: 0,
  })
  expect(source.deleteLine).not.toHaveBeenCalled()

  await userEvent.click(dialog.getByText('Close', { selector: '.btn' }))

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(screen.getByLabelText('Number')).toHaveValue('1')
})
