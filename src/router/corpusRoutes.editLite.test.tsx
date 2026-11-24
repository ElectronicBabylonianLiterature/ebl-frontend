import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { guestSession } from 'auth/Session'
import { ChapterOutline } from 'corpus/application/edit-lite/chapterOutline'
import { toLineEditsDto } from 'corpus/application/edit-lite/lineEdits'
import { Line } from 'corpus/domain/line'
import { readOnlyNotice } from 'corpus/ui/edit-lite/ChapterEditLiteView'
import {
  chapterEditPath,
  countRequests,
  createEditLiteFakeApi,
  editFirstLine,
  editLiteChapterId,
  editLiteHeading,
  editLiteRedirectPath,
  pageTabNames,
  renderEditLiteRoute,
  renderLoadedEditLiteRoute,
  waitForLoadedEditLite,
} from 'corpus/ui/edit-lite/ChapterEditLiteView.testSupport'
import {
  buildEditLiteLines,
  buildEditLiteOutline,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import EditLiteFakeApi from 'corpus/ui/edit-lite/EditLiteFakeApi.testSupport'
import { setLineNumber } from 'corpus/ui/edit-lite/lineDraft'
import {
  loadedEditor,
  options,
  selectedOptions,
} from 'corpus/ui/edit-lite/SplitLines.testSupport'
import AppDriver from 'test-support/AppDriver'
import { createChapterUrl } from 'test-support/FakeApiExpectation'

jest.mock('editor/Editor', () =>
  jest.requireActual('editor/Editor.testSupport'),
)

const chapterUrl = createChapterUrl(editLiteChapterId)
const snapshotUrl = `${chapterUrl}/display?lines=0&variants=0`
const savedLineUrl = `${chapterUrl}/lines?offset=0&limit=1&revision=revision-2`
const lines: readonly Line[] = buildEditLiteLines()
const outline: ChapterOutline = buildEditLiteOutline(lines)

function createApiFakeApi(): EditLiteFakeApi {
  return createEditLiteFakeApi()
    .expectChapterOutline(outline)
    .allowChapterLines(outline, 0, 1, lines)
    .allowChapterLines(outline, 0, 2, lines)
}

function countClassicRequests(fakeApi: EditLiteFakeApi): number {
  return (
    countRequests(fakeApi, chapterUrl) + countRequests(fakeApi, snapshotUrl)
  )
}

test('the application renders the new editor at the edit route', async () => {
  const fakeApi = createApiFakeApi()
  const appDriver = new AppDriver(fakeApi.client)
    .withSession()
    .withPath(chapterEditPath)
    .render()

  await appDriver.waitForText(editLiteHeading)
  const editor = await loadedEditor('1')

  expect(
    screen.getByRole('heading', { name: editLiteHeading }),
  ).toBeInTheDocument()
  appDriver.breadcrumbs.expectCrumbs(['Corpus', 'Edit'])
  expect(pageTabNames()).toEqual(['Lines', 'Manuscripts', 'Import'])
  expect(options()).toHaveLength(lines.length)
  expect(within(editor).getByLabelText('Number')).toHaveValue('1')
  expect(countClassicRequests(fakeApi)).toBe(0)
  fakeApi.verifyExpectations()
})

test('the old lite address redirects to the edit route and keeps the line', async () => {
  const manyLines = buildEditLiteLines(40)
  const manyLinesOutline = buildEditLiteOutline(manyLines)
  const fakeApi = createEditLiteFakeApi()
    .expectChapterOutline(manyLinesOutline)
    .allowAllChapterLines(manyLinesOutline, manyLines)
  renderEditLiteRoute({
    fakeApi,
    path: editLiteRedirectPath,
    search: '?line=40',
    showLocation: true,
  })
  await waitForLoadedEditLite()
  const editor = await loadedEditor('40')

  expect(screen.getByTestId('location')).toHaveTextContent(
    `${chapterEditPath}?line=40`,
  )
  expect(within(editor).getByLabelText('Number')).toHaveValue('40')
  expect(selectedOptions()).toEqual([options()[39]])
  expect(countClassicRequests(fakeApi)).toBe(0)
  fakeApi.verifyExpectations()
})

test('the old lite address without parameters redirects to the edit route', async () => {
  renderEditLiteRoute({
    fakeApi: createApiFakeApi(),
    path: editLiteRedirectPath,
    showLocation: true,
  })
  await waitForLoadedEditLite()
  await loadedEditor('1')

  expect(screen.getByTestId('location')).toHaveTextContent(
    new RegExp(`^${chapterEditPath}$`),
  )
})

test('the edit route ignores a source parameter', async () => {
  const fakeApi = createApiFakeApi()
  await renderLoadedEditLiteRoute({ fakeApi, search: '?source=legacy' })
  const editor = await loadedEditor('1')

  expect(within(editor).getByLabelText('Number')).toHaveValue('1')
  expect(countClassicRequests(fakeApi)).toBe(0)
  fakeApi.verifyExpectations()
})

test('the edit route saves the edited line and shows the new outline', async () => {
  const savedLines = [setLineNumber(lines[0], '1a'), ...lines.slice(1)]
  const savedOutline = buildEditLiteOutline(savedLines, 'revision-2')
  const fakeApi = createApiFakeApi()
    .expectUpdateEditedLines(
      outline,
      toLineEditsDto(0, savedLines[0]),
      savedOutline,
    )
    .allowChapterLines(savedOutline, 0, 1, savedLines)
  await renderLoadedEditLiteRoute({ fakeApi })
  await editFirstLine()

  await userEvent.click(screen.getByRole('button', { name: 'Save line' }))

  expect(
    await screen.findByRole('region', { name: 'Line 1a' }),
  ).toBeInTheDocument()
  expect(options()[0]).toHaveTextContent(/^1a%n/)
  expect(countRequests(fakeApi, savedLineUrl)).toBe(1)
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  expect(fakeApi.client.postJson).toHaveBeenCalledTimes(1)
  fakeApi.verifyExpectations()
})

test('a reader gets a read-only page', async () => {
  const fakeApi = createApiFakeApi()
  await renderLoadedEditLiteRoute({ fakeApi, session: guestSession })
  const editor = await loadedEditor('1')

  expect(screen.getByRole('alert')).toHaveTextContent(readOnlyNotice)
  expect(within(editor).getByLabelText('Number')).toBeDisabled()
  expect(pageTabNames()).toEqual(['Lines', 'Manuscripts'])
  expect(
    screen.queryByRole('button', { name: 'Save line' }),
  ).not.toBeInTheDocument()
  expect(
    screen.queryByRole('button', { name: 'Add line' }),
  ).not.toBeInTheDocument()
  expect(fakeApi.client.postJson).not.toHaveBeenCalled()
  expect(countClassicRequests(fakeApi)).toBe(0)
})
