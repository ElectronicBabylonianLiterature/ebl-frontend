import React from 'react'
import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  ImportedLines,
  useEditLiteContext,
} from 'corpus/ui/edit-lite/EditLiteContext'
import EditLiteImport from 'corpus/ui/edit-lite/EditLiteImport'
import {
  EditLiteRenderOptions,
  EditLiteRenderResult,
  renderWithEditLite,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import { holdNextCall } from 'corpus/ui/edit-lite/useEditLite.testSupport'
import useLineImport from 'corpus/ui/edit-lite/useLineImport'

jest.mock('editor/Editor', () =>
  jest.requireActual('editor/Editor.testSupport'),
)

interface RenderedImport extends EditLiteRenderResult {
  readonly onImported: jest.Mock<void, [ImportedLines]>
}

const atf = '4. kur\n5. ra'

function ImportHarness({
  onImported,
}: {
  readonly onImported: (importedLines: ImportedLines) => void
}): JSX.Element {
  const { actions } = useEditLiteContext()
  return <EditLiteImport lineImport={useLineImport(actions, onImported)} />
}

function renderImport(options: EditLiteRenderOptions = {}): RenderedImport {
  const onImported = jest.fn<void, [ImportedLines]>()
  const view = renderWithEditLite(
    <ImportHarness onImported={onImported} />,
    options,
  )
  return { ...view, onImported }
}

function atfEditor(): HTMLElement {
  return screen.getByLabelText(/^ChapterImport-/)
}

async function importAtf(): Promise<void> {
  await userEvent.type(atfEditor(), atf)
  await userEvent.click(screen.getByRole('button', { name: 'Save' }))
}

test('explains the import like the classic editor', () => {
  renderImport()

  expect(
    screen.getByText(/The imported lines are added to the end of the chapter/),
  ).toBeVisible()
  expect(atfEditor()).toHaveValue('')
})

test('imports the ATF and reports the new lines', async () => {
  const view = renderImport()
  const held = holdNextCall(view.source.importLines)
  await importAtf()

  expect(screen.getByText('Importing...')).toBeVisible()
  expect(atfEditor()).toBeDisabled()
  expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
  expect(view.source.importLines.mock.calls).toEqual([[atf]])
  expect(view.onImported).not.toHaveBeenCalled()

  await act(async () => held.resolve())

  expect(view.onImported.mock.calls).toEqual([[{ firstIndex: 3, count: 2 }]])
  expect(view.getState().outline.lines).toHaveLength(5)
  expect(screen.queryByText('Importing...')).not.toBeInTheDocument()
  expect(atfEditor()).toBeEnabled()
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})

test('shows a rejected import next to the ATF and keeps the text', async () => {
  const view = renderImport()
  view.source.importLines.mockRejectedValueOnce(
    new Error('Invalid line 2: unexpected token'),
  )
  await importAtf()

  expect(
    await screen.findByText('Invalid line 2: unexpected token'),
  ).toHaveAttribute('role', 'alert')
  expect(atfEditor()).toHaveValue(atf)
  expect(atfEditor()).toBeEnabled()
  expect(view.onImported).not.toHaveBeenCalled()
  expect(view.getState().outline.lines).toHaveLength(3)

  await userEvent.click(screen.getByRole('button', { name: 'Save' }))

  await waitFor(() => expect(view.onImported).toHaveBeenCalledTimes(1))
  expect(
    screen.queryByText('Invalid line 2: unexpected token'),
  ).not.toBeInTheDocument()
})
