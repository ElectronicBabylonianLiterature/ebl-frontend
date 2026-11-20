import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { guestSession } from 'auth/Session'
import {
  legacyNotice,
  previewNotice,
  readOnlyNotice,
} from 'corpus/ui/edit-lite/ChapterEditLiteView'
import {
  countRequests,
  createEditLiteFakeApi,
  editFirstLine,
  editLiteChapterId,
  mockEditSource,
  openManuscriptsTab,
  openTab,
  renderLoadedEditLiteRoute,
  tab,
  tabPanel,
} from 'corpus/ui/edit-lite/ChapterEditLiteView.testSupport'
import {
  firstSiglum,
  openManuscript,
} from 'corpus/ui/edit-lite/EditLiteManuscripts.testSupport'
import {
  loadedEditor,
  options,
  selectedOptions,
} from 'corpus/ui/edit-lite/SplitLines.testSupport'
import { createChapterUrl } from 'test-support/FakeApiExpectation'

jest.mock('editor/Editor', () =>
  jest.requireActual('editor/Editor.testSupport'),
)
jest.mock('corpus/application/edit-lite/createChapterEditSource')

const manuscriptsUrl = `${createChapterUrl(editLiteChapterId)}/manuscripts`

function notice(): HTMLElement {
  return screen.getByText(previewNotice, { exact: false })
}

async function importAtf(atf: string): Promise<void> {
  await openTab('Import')
  const panel = within(tabPanel('Import'))
  await userEvent.type(panel.getByLabelText(/^ChapterImport-/), atf)
  await userEvent.click(panel.getByRole('button', { name: 'Save' }))
}

test('the import editor is mounted only while the import tab is open', async () => {
  mockEditSource()
  await renderLoadedEditLiteRoute()

  expect(screen.queryByLabelText(/^ChapterImport-/)).not.toBeInTheDocument()

  await openTab('Import')

  expect(
    within(tabPanel('Import')).getByLabelText(/^ChapterImport-/),
  ).toHaveValue('')

  await openTab('Lines')

  expect(
    screen.queryByRole('tabpanel', { name: 'Import' }),
  ).not.toBeInTheDocument()
  expect(screen.queryByLabelText(/^ChapterImport-/)).not.toBeInTheDocument()
  expect(await screen.findByLabelText('Number')).toHaveValue('1')
})

test('an import shows the new lines at the end of the lines tab and keeps the drafts', async () => {
  const source = mockEditSource()
  await renderLoadedEditLiteRoute()
  await editFirstLine()
  await importAtf('4. kur\n5. ra')
  const editor = await loadedEditor('4')

  expect(tab('Lines')).toHaveAttribute('aria-selected', 'true')
  expect(tabPanel('Lines')).toHaveClass('active')
  expect(source.importLines.mock.calls).toEqual([['4. kur\n5. ra']])
  expect(options()).toHaveLength(5)
  expect(options()[3]).toHaveTextContent(/^44\. kur/)
  expect(options()[4]).toHaveTextContent(/^55\. ra/)
  expect(selectedOptions()).toEqual([options()[3]])
  expect(within(editor).getByText('4 of 5')).toBeVisible()
  expect(within(options()[0]).getByText('edited')).toBeVisible()
  expect(screen.getByTestId('edit-lite-line-count')).toHaveTextContent('5')

  await userEvent.click(options()[0])

  expect(within(await loadedEditor('1')).getByLabelText('Number')).toHaveValue(
    '1a',
  )

  await openTab('Import')

  expect(
    within(tabPanel('Import')).getByLabelText(/^ChapterImport-/),
  ).toHaveValue('')
})

test('a failed import is still shown after looking at the lines', async () => {
  const source = mockEditSource()
  source.importLines.mockRejectedValueOnce(new Error('Invalid ATF in line 1'))
  await renderLoadedEditLiteRoute()
  await importAtf('kur')

  expect(await screen.findByText('Invalid ATF in line 1')).toBeVisible()
  expect(tabPanel('Import')).toHaveClass('active')

  await openTab('Lines')
  await openTab('Import')

  expect(screen.getByText('Invalid ATF in line 1')).toBeVisible()
})

test('an import that adds nothing leaves the selection alone', async () => {
  mockEditSource()
  await renderLoadedEditLiteRoute({ search: '?line=2' })
  await loadedEditor('2')
  await importAtf(' ')
  await loadedEditor('2')

  expect(tab('Lines')).toHaveAttribute('aria-selected', 'true')
  expect(options()).toHaveLength(3)
  expect(selectedOptions()).toEqual([options()[1]])
})

test('saved manuscripts are loaded again and their sigla reach the line editor', async () => {
  const fakeApi = createEditLiteFakeApi()
  const source = mockEditSource()
  await renderLoadedEditLiteRoute({ fakeApi })
  await editFirstLine()
  await openManuscriptsTab()
  const manuscript = await openManuscript(firstSiglum)
  await userEvent.type(within(manuscript).getByLabelText('Siglum'), '9')
  await userEvent.click(screen.getByRole('button', { name: 'Add fragment' }))
  await userEvent.keyboard('BM.2')
  await userEvent.click(
    screen.getByRole('button', { name: 'Save manuscripts' }),
  )

  expect(
    await within(tabPanel('Manuscripts')).findByText('1 manuscript'),
  ).toBeVisible()
  expect(source.saveManuscripts).toHaveBeenCalledTimes(1)
  expect(source.saveManuscripts.mock.calls[0][0]).toMatchObject([
    { id: 1, siglumDisambiguator: '1a9' },
  ])
  expect(source.saveManuscripts.mock.calls[0][1]).toEqual(['K.1', 'BM.2'])
  expect(countRequests(fakeApi, manuscriptsUrl)).toBe(2)
  expect(
    screen.getByRole('button', { name: 'Edit uncertain fragment BM.2' }),
  ).toBeVisible()
  expect(
    screen.getByRole('button', { name: 'Save manuscripts' }),
  ).toBeDisabled()
  expect(screen.getByTestId('edit-lite-manuscript-count')).toHaveTextContent(
    '1',
  )

  await openTab('Lines')
  const editor = within(await loadedEditor('1'))

  expect(editor.getByLabelText('Number')).toHaveValue('1a')
  expect(editor.getByRole('button', { name: 'Siglum NinNA1a9' })).toBeVisible()
  expect(editor.getByRole('button', { name: 'Siglum <unknown>' })).toBeVisible()
})

test('a reader gets a read-only page in both source modes', async () => {
  const source = mockEditSource({ kind: 'legacy' })
  await renderLoadedEditLiteRoute({ session: guestSession })
  const editor = within(await loadedEditor('1'))

  expect(notice()).toHaveTextContent(readOnlyNotice)
  expect(notice()).not.toHaveTextContent(legacyNotice)
  expect(readOnlyNotice).toContain('permission to edit texts')
  expect(screen.getAllByRole('tab').map((item) => item.textContent)).toEqual([
    'Lines',
    'Manuscripts',
  ])
  expect(editor.getByLabelText('Number')).toBeDisabled()
  expect(editor.getByText('NinNA1a')).toBeVisible()
  expect(
    within(tabPanel('Lines'))
      .getAllByRole('button')
      .map((control) => control.textContent),
  ).toEqual(['Previous', 'Next'])

  await userEvent.click(editor.getByRole('textbox', { name: 'Translation' }))

  expect(
    editor.queryByRole('group', { name: 'Translation' }),
  ).not.toBeInTheDocument()
  expect(source.describeChange).not.toHaveBeenCalled()
})

test('a reader can read the manuscripts but not edit them', async () => {
  mockEditSource()
  await renderLoadedEditLiteRoute({ session: guestSession })
  await openManuscriptsTab()
  const manuscript = within(await openManuscript(firstSiglum))

  expect(manuscript.getByLabelText('Museum Number')).toHaveValue('K.5419.C')
  expect(manuscript.getByLabelText('Museum Number')).toBeDisabled()
  expect(
    within(tabPanel('Manuscripts'))
      .getAllByRole('button')
      .map((control) => control.textContent),
  ).toEqual([expect.stringContaining(firstSiglum), 'Add Reference'])
  expect(
    manuscript.getByRole('button', { name: 'Add Reference' }),
  ).toBeDisabled()
  expect(within(tabPanel('Manuscripts')).getByText('K.1')).toBeVisible()
})

test('a writer with a legacy source is told that saving is a dry run', async () => {
  mockEditSource({ kind: 'legacy' })
  await renderLoadedEditLiteRoute()

  expect(notice()).toHaveTextContent(legacyNotice)
  expect(notice()).not.toHaveTextContent(readOnlyNotice)
  expect(screen.getByRole('tab', { name: 'Import' })).toBeVisible()
  expect(screen.getByRole('button', { name: 'Add line' })).toBeEnabled()
})
