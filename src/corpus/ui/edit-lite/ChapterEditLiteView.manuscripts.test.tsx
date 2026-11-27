import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  chapterEditPath,
  countRequests,
  createEditLiteFakeApi,
  editFirstLine,
  editLiteChapterId,
  editLiteManuscriptDtos,
  mockEditSource,
  openManuscriptsTab,
  openTab,
  pageTabNames,
  renderEditLiteRoute,
  renderLoadedEditLiteRoute,
  secondChapterEditPath,
  secondEditLiteChapterId,
  tabPanel,
  waitForLoadedLines,
} from 'corpus/ui/edit-lite/ChapterEditLiteView.testSupport'
import EditLiteFakeApi from 'corpus/ui/edit-lite/EditLiteFakeApi.testSupport'
import {
  firstSiglum,
  listUncertainFragments,
  openManuscript,
} from 'corpus/ui/edit-lite/EditLiteManuscripts.testSupport'
import { loadedEditor } from 'corpus/ui/edit-lite/SplitLines.testSupport'
import { createChapterUrl } from 'test-support/FakeApiExpectation'
import { ChapterId } from 'transliteration/domain/chapter-id'

jest.mock('editor/Editor', () =>
  jest.requireActual('editor/Editor.testSupport'),
)
jest.mock('corpus/application/edit-lite/createChapterEditSource')

const unlistedChapterId: ChapterId = { ...editLiteChapterId, name: 'III' }
const unlistedChapterPath = '/corpus/L/1/2/SB/III/edit'

function manuscriptsUrl(id: ChapterId): string {
  return `${createChapterUrl(id)}/manuscripts`
}

function countManuscriptRequests(fakeApi: EditLiteFakeApi): number {
  return countRequests(fakeApi, manuscriptsUrl(editLiteChapterId))
}

async function openUncertainFragments(
  id: ChapterId,
  path: string,
): Promise<(string | null)[]> {
  const fakeApi = createEditLiteFakeApi()
  fakeApi.allowChapterManuscripts(id, editLiteManuscriptDtos)
  mockEditSource()
  renderEditLiteRoute({ fakeApi, path })
  await screen.findByRole('tab', { name: 'Manuscripts' })
  await waitForLoadedLines()
  await openManuscriptsTab()
  return listUncertainFragments(tabPanel('Manuscripts'))
}

test('does not load the manuscripts before their tab is opened', async () => {
  const fakeApi = createEditLiteFakeApi()
  mockEditSource()
  await renderLoadedEditLiteRoute({ fakeApi })

  expect(pageTabNames()).toEqual(['Lines', 'Manuscripts', 'Import'])
  expect(countManuscriptRequests(fakeApi)).toBe(0)
  expect(
    screen.queryByRole('list', { name: 'Manuscripts', hidden: true }),
  ).not.toBeInTheDocument()
})

test('loads the manuscripts once and keeps them mounted', async () => {
  const fakeApi = createEditLiteFakeApi()
  mockEditSource()
  await renderLoadedEditLiteRoute({ fakeApi })

  const list = await openManuscriptsTab()

  expect(within(list).getAllByRole('listitem')).toHaveLength(1)
  expect(
    within(tabPanel('Manuscripts')).getByText('1 manuscript'),
  ).toBeInTheDocument()
  expect(tabPanel('Lines')).not.toHaveClass('active')
  expect(countManuscriptRequests(fakeApi)).toBe(1)

  await openTab('Lines')

  expect(tabPanel('Manuscripts')).not.toHaveClass('active')
  expect(tabPanel('Manuscripts')).toContainElement(list)

  await openTab('Manuscripts')

  expect(screen.getByRole('list', { name: 'Manuscripts' })).toBe(list)
  expect(countManuscriptRequests(fakeApi)).toBe(1)
})

test('keeps manuscript edits across tabs and parameter changes', async () => {
  const lineLink = `${chapterEditPath}?line=2`
  const fakeApi = createEditLiteFakeApi()
  mockEditSource()
  await renderLoadedEditLiteRoute({ fakeApi, links: [lineLink] })
  await openManuscriptsTab()
  const editor = await openManuscript(firstSiglum)

  await userEvent.type(within(editor).getByLabelText('Accession'), 'A.1')

  expect(screen.getByText('1 manuscript, 1 edited')).toBeInTheDocument()

  await openTab('Lines')
  await userEvent.click(screen.getByRole('link', { name: lineLink }))
  await loadedEditor('1')
  await openTab('Manuscripts')

  expect(screen.getByText('1 manuscript, 1 edited')).toBeInTheDocument()
  expect(screen.getByLabelText('Accession')).toHaveValue('A.1')
  expect(countManuscriptRequests(fakeApi)).toBe(1)
})

test('keeps line drafts while the manuscripts tab is open', async () => {
  mockEditSource()
  await renderLoadedEditLiteRoute()
  await editFirstLine()

  await openManuscriptsTab()

  expect(tabPanel('Lines')).not.toHaveClass('active')
  expect(tabPanel('Lines')).toContainElement(screen.getByLabelText('Number'))

  await openTab('Lines')

  expect(screen.getByLabelText('Number')).toHaveValue('1a')
})

test('starts with the uncertain fragments listed for the chapter', async () => {
  expect(
    await openUncertainFragments(editLiteChapterId, chapterEditPath),
  ).toEqual(['K.1'])
})

test('starts with no uncertain fragments for a chapter without any', async () => {
  expect(
    await openUncertainFragments(
      secondEditLiteChapterId,
      secondChapterEditPath,
    ),
  ).toEqual([])
})

test('starts with no uncertain fragments for a chapter the text does not list', async () => {
  expect(
    await openUncertainFragments(unlistedChapterId, unlistedChapterPath),
  ).toEqual([])
})
