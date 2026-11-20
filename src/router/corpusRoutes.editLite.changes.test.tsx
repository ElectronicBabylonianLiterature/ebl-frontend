import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChapterOutline } from 'corpus/application/edit-lite/chapterOutline'
import {
  toDeletedLineDto,
  toLineEditsDto,
  toNewLineDto,
} from 'corpus/application/edit-lite/lineEdits'
import { createDefaultLineFactory } from 'corpus/application/line-factory'
import { createLine, Line } from 'corpus/domain/line'
import {
  createEditLiteFakeApi,
  editLiteChapterId,
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
import { setLineNumber } from 'corpus/ui/edit-lite/lineDraft'
import {
  loadedEditor,
  options,
  selectedOptions,
} from 'corpus/ui/edit-lite/SplitLines.testSupport'
import { createChapterUrl } from 'test-support/FakeApiExpectation'

jest.mock('editor/Editor', () =>
  jest.requireActual('editor/Editor.testSupport'),
)

const chapterUrl = createChapterUrl(editLiteChapterId)
const lines: readonly Line[] = buildEditLiteLines()
const outline: ChapterOutline = buildEditLiteOutline(lines)

function createFakeApi(): EditLiteFakeApi {
  return createEditLiteFakeApi()
    .expectChapterOutline(outline)
    .allowAllChapterLines(outline, lines)
}

function button(name: string): HTMLElement {
  return screen.getByRole('button', { name })
}

function postedPaths(fakeApi: EditLiteFakeApi): string[] {
  return fakeApi.client.postJson.mock.calls.map(([path]) => path)
}

test('a new line is posted and becomes the last line of the chapter', async () => {
  const newLine = setLineNumber(createDefaultLineFactory(lines[2])(), '4a')
  const savedLines = [...lines, newLine]
  const savedOutline = buildEditLiteOutline(savedLines, 'revision-2')
  const fakeApi = createFakeApi()
    .expectUpdateEditedLines(outline, toNewLineDto(newLine), savedOutline)
    .allowAllChapterLines(savedOutline, savedLines)
  await renderLoadedEditLiteRoute({ fakeApi })
  await loadedEditor('1')
  await userEvent.click(button('Add line'))
  const editor = screen.getByRole('region', { name: 'New line' })
  await userEvent.type(await within(editor).findByLabelText('Number'), 'a')

  expect(within(options()[3]).getByText('new')).toBeVisible()

  await userEvent.click(button('Save line'))

  expect(await screen.findByRole('region', { name: 'Line 4a' })).toBe(editor)
  expect(options()).toHaveLength(4)
  expect(selectedOptions()).toEqual([options()[3]])
  expect(screen.queryByText('new')).not.toBeInTheDocument()
  expect(within(editor).getByLabelText('Number')).toHaveValue('4a')
  expect(button('Save line')).toBeDisabled()
  expect(screen.getByTestId('edit-lite-line-count')).toHaveTextContent('4')
  expect(fakeApi.client.postJson).toHaveBeenCalledTimes(1)
  fakeApi.verifyExpectations()
})

test('a line is deleted and the draft of a later line stays on its line', async () => {
  const remainingLines = [lines[0], lines[2]]
  const deletedOutline = buildEditLiteOutline(remainingLines, 'revision-2')
  const savedLines = [lines[0], setLineNumber(lines[2], '3x')]
  const savedOutline = buildEditLiteOutline(savedLines, 'revision-3')
  const fakeApi = createFakeApi()
    .expectUpdateEditedLines(outline, toDeletedLineDto(1), deletedOutline)
    .allowAllChapterLines(deletedOutline, remainingLines)
    .expectUpdateEditedLines(
      deletedOutline,
      toLineEditsDto(1, savedLines[1]),
      savedOutline,
    )
    .allowAllChapterLines(savedOutline, savedLines)
  await renderLoadedEditLiteRoute({ fakeApi, search: '?line=3' })
  const thirdLine = await loadedEditor('3')
  await userEvent.type(within(thirdLine).getByLabelText('Number'), 'x')
  await userEvent.click(options()[1])
  await loadedEditor('2')
  await userEvent.click(button('Delete line'))
  await userEvent.click(
    within(screen.getByRole('dialog', { name: 'Delete line' })).getByRole(
      'button',
      { name: 'Delete line' },
    ),
  )
  const editor = await loadedEditor('3')

  expect(options()).toHaveLength(2)
  expect(selectedOptions()).toEqual([options()[1]])
  expect(within(options()[1]).getByText('edited')).toBeVisible()
  expect(within(options()[0]).queryByText('edited')).not.toBeInTheDocument()
  expect(within(editor).getByLabelText('Number')).toHaveValue('3x')

  await userEvent.click(button('Save line'))

  expect(await screen.findByRole('region', { name: 'Line 3x' })).toBe(editor)
  expect(screen.queryByText('edited')).not.toBeInTheDocument()
  expect(postedPaths(fakeApi)).toEqual([
    `${chapterUrl}/lines?view=outline&revision=revision-1`,
    `${chapterUrl}/lines?view=outline&revision=revision-2`,
  ])
  fakeApi.verifyExpectations()
})

test('imported lines appear at the end and the next save uses the new revision', async () => {
  const atf = '4. kur\n5. ra'
  const importedLines = [
    ...lines,
    createLine({ number: '4' }),
    createLine({ number: '5' }),
  ]
  const importedOutline = buildEditLiteOutline(importedLines, 'revision-2')
  const savedLines = [setLineNumber(lines[0], '1a'), ...importedLines.slice(1)]
  const savedOutline = buildEditLiteOutline(savedLines, 'revision-3')
  const fakeApi = createFakeApi()
    .expectImportLines(outline, atf, importedOutline)
    .allowAllChapterLines(importedOutline, importedLines)
    .expectUpdateEditedLines(
      importedOutline,
      toLineEditsDto(0, savedLines[0]),
      savedOutline,
    )
    .allowAllChapterLines(savedOutline, savedLines)
  await renderLoadedEditLiteRoute({ fakeApi })
  await userEvent.type(
    within(await loadedEditor('1')).getByLabelText('Number'),
    'a',
  )
  await openTab('Import')
  await userEvent.type(
    within(tabPanel('Import')).getByLabelText(/^ChapterImport-/),
    atf,
  )
  await userEvent.click(
    within(tabPanel('Import')).getByRole('button', { name: 'Save' }),
  )
  await loadedEditor('4')

  expect(tabPanel('Lines')).toHaveClass('active')
  expect(options()).toHaveLength(5)
  expect(selectedOptions()).toEqual([options()[3]])
  expect(within(options()[0]).getByText('edited')).toBeVisible()

  await userEvent.click(options()[0])
  await loadedEditor('1')
  await userEvent.click(button('Save line'))

  expect(await screen.findByRole('region', { name: 'Line 1a' })).toBeVisible()
  expect(postedPaths(fakeApi)).toEqual([
    `${chapterUrl}/import?view=outline&revision=revision-1`,
    `${chapterUrl}/lines?view=outline&revision=revision-2`,
  ])
  fakeApi.verifyExpectations()
})

test('manuscripts are posted, loaded again and their sigla reach the lines', async () => {
  const savedOutline: ChapterOutline = {
    ...buildEditLiteOutline(lines, 'revision-2'),
    uncertainFragments: ['K.1'],
    manuscripts: [
      { id: 1, siglum: 'NinNA1a9', museumNumber: 'K.5419.C', accession: '' },
      outline.manuscripts[1],
    ],
  }
  const fakeApi = createFakeApi()
    .expectSaveManuscripts(
      outline,
      {
        manuscripts: [
          expect.objectContaining({
            id: 1,
            siglumDisambiguator: '1a9',
            museumNumber: 'K.5419.C',
            provenance: 'Nineveh',
          }),
        ],
        uncertainFragments: ['K.1'],
      },
      savedOutline,
    )
    .allowAllChapterLines(savedOutline, lines)
  await renderLoadedEditLiteRoute({ fakeApi })
  await loadedEditor('1')
  await openManuscriptsTab()
  const manuscript = within(await openManuscript(firstSiglum))
  await userEvent.type(manuscript.getByLabelText('Siglum'), '9')
  await userEvent.click(button('Save manuscripts'))

  expect(
    await within(tabPanel('Manuscripts')).findByText('1 manuscript'),
  ).toBeVisible()
  expect(
    fakeApi.client.fetchJson.mock.calls.filter(
      ([path]) => path === `${chapterUrl}/manuscripts`,
    ),
  ).toHaveLength(2)
  expect(button('Save manuscripts')).toBeDisabled()
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

  await openTab('Lines')

  expect(
    within(await loadedEditor('1')).getByRole('button', {
      name: 'Siglum NinNA1a9',
    }),
  ).toBeVisible()
  expect(postedPaths(fakeApi)).toEqual([
    `${chapterUrl}/manuscripts?view=outline&revision=revision-1`,
  ])
  fakeApi.verifyExpectations()
})
