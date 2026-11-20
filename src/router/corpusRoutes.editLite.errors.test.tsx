import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { chapterChangedMessage } from 'corpus/application/edit-lite/chapterChangeMessages'
import { ChapterOutline } from 'corpus/application/edit-lite/chapterOutline'
import { Line } from 'corpus/domain/line'
import {
  createEditLiteFakeApi,
  openManuscriptsTab,
  openTab,
  renderLoadedEditLiteRoute,
  tabPanel,
} from 'corpus/ui/edit-lite/ChapterEditLiteView.testSupport'
import {
  buildEditLiteLines,
  buildEditLiteOutline,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import EditLiteFakeApi from 'corpus/ui/edit-lite/EditLiteFakeApi.testSupport'
import {
  firstSiglum,
  openManuscript,
} from 'corpus/ui/edit-lite/EditLiteManuscripts.testSupport'
import {
  loadedEditor,
  options,
} from 'corpus/ui/edit-lite/SplitLines.testSupport'
import { ApiError } from 'http/ApiClient'

jest.mock('editor/Editor', () =>
  jest.requireActual('editor/Editor.testSupport'),
)

const lines: readonly Line[] = buildEditLiteLines()
const outline: ChapterOutline = buildEditLiteOutline(lines)
const conflict = new ApiError('Conflict', {}, 409)
const validationMessage = 'Request data failed validation: invalid siglum'
const validationError = new ApiError(validationMessage, {}, 422)

function createFakeApi(rejection: Error): EditLiteFakeApi {
  const fakeApi = createEditLiteFakeApi()
    .expectChapterOutline(outline)
    .allowAllChapterLines(outline, lines)
  fakeApi.client.postJson.mockRejectedValue(rejection)
  return fakeApi
}

function button(name: string): HTMLElement {
  return screen.getByRole('button', { name })
}

async function confirmDeletion(): Promise<void> {
  await userEvent.click(button('Delete line'))
  await userEvent.click(
    within(screen.getByRole('dialog', { name: 'Delete line' })).getByRole(
      'button',
      { name: 'Delete line' },
    ),
  )
}

test('a deletion of a chapter that was changed meanwhile asks to reload', async () => {
  const fakeApi = createFakeApi(conflict)
  await renderLoadedEditLiteRoute({ fakeApi })
  const editor = within(await loadedEditor('1'))
  await confirmDeletion()

  expect(await editor.findByRole('alert')).toHaveTextContent(
    chapterChangedMessage,
  )
  expect(options()).toHaveLength(3)
  expect(editor.getByLabelText('Number')).toHaveValue('1')
  expect(fakeApi.client.postJson).toHaveBeenCalledTimes(1)
})

test('a new line that the server rejects keeps its draft next to the reason', async () => {
  const fakeApi = createFakeApi(validationError)
  await renderLoadedEditLiteRoute({ fakeApi })
  await loadedEditor('1')
  await userEvent.click(button('Add line'))
  const editor = within(screen.getByRole('region', { name: 'New line' }))
  await userEvent.type(await editor.findByLabelText('Number'), 'a')
  await userEvent.click(button('Save line'))

  expect(await editor.findByRole('alert')).toHaveTextContent(validationMessage)
  expect(editor.getByLabelText('Number')).toHaveValue('4a')
  expect(within(options()[3]).getByText('new')).toBeVisible()
  expect(button('Save line')).toBeEnabled()
})

test.each([
  ['a conflict', conflict, chapterChangedMessage],
  ['a validation error', validationError, validationMessage],
])(
  'an import that fails with %s says so on the import tab',
  async (_name, rejection, message) => {
    const fakeApi = createFakeApi(rejection)
    await renderLoadedEditLiteRoute({ fakeApi })
    await openTab('Import')
    const panel = within(tabPanel('Import'))
    await userEvent.type(panel.getByLabelText(/^ChapterImport-/), '4. kur')
    await userEvent.click(panel.getByRole('button', { name: 'Save' }))

    expect(await panel.findByText(message)).toHaveAttribute('role', 'alert')
    expect(tabPanel('Import')).toHaveClass('active')
    expect(panel.getByLabelText(/^ChapterImport-/)).toHaveValue('4. kur')
    expect(options()).toHaveLength(3)
  },
)

test.each([
  ['a conflict', conflict, chapterChangedMessage],
  ['a validation error', validationError, validationMessage],
])(
  'manuscripts that fail to save with %s keep their edits',
  async (_name, rejection, message) => {
    const fakeApi = createFakeApi(rejection)
    await renderLoadedEditLiteRoute({ fakeApi })
    await openManuscriptsTab()
    const manuscript = within(await openManuscript(firstSiglum))
    await userEvent.type(manuscript.getByLabelText('Notes'), '!')
    await userEvent.click(button('Save manuscripts'))
    const panel = within(tabPanel('Manuscripts'))

    expect(await panel.findByText(message)).toHaveAttribute('role', 'alert')
    expect(panel.getByText('1 manuscript, 1 edited')).toBeVisible()
    expect(manuscript.getByLabelText('Notes')).toHaveValue('!')
    expect(button('Save manuscripts')).toBeEnabled()
  },
)
