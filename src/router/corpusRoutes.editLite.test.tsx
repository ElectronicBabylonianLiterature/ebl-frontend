import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { guestSession } from 'auth/Session'
import {
  editProvenanceRecords,
  snapshotDto,
} from 'corpus/application/edit-lite/chapterEditSource.testSupport'
import { toLineEditsDto } from 'corpus/application/edit-lite/lineEdits'
import { Line } from 'corpus/domain/line'
import { legacyNotice } from 'corpus/ui/edit-lite/ChapterEditLiteView'
import {
  countRequests,
  createEditLiteFakeApi,
  editLiteChapterId,
  editLiteHeading,
  editLitePath,
  editLiteTextDto,
  renderEditLiteRoute,
  renderLoadedEditLiteRoute,
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
} from 'corpus/ui/edit-lite/SplitLines.testSupport'
import AppDriver from 'test-support/AppDriver'
import { createChapterUrl } from 'test-support/FakeApiExpectation'

jest.mock('editor/Editor', () =>
  jest.requireActual('editor/Editor.testSupport'),
)

const chapterUrl = createChapterUrl(editLiteChapterId)
const outlineUrl = `${chapterUrl}/outline`
const snapshotUrl = `${chapterUrl}/display?lines=0&variants=0`
const lines: readonly Line[] = buildEditLiteLines()

function createApiFakeApi(): EditLiteFakeApi {
  return createEditLiteFakeApi()
    .expectChapterOutline(buildEditLiteOutline(lines))
    .allowChapterLines(editLiteChapterId, 0, 1, lines)
    .allowChapterLines(editLiteChapterId, 0, 2, lines)
}

function createLegacyFakeApi(): EditLiteFakeApi {
  const fakeApi = new EditLiteFakeApi().expectChapterAtfSnapshot(
    editLiteChapterId,
    snapshotDto,
  )
  fakeApi
    .allowProvenances(editProvenanceRecords.map((record) => ({ ...record })))
    .expectText(editLiteTextDto)
  return fakeApi
}

function sourceKind(): HTMLElement {
  return screen.getByTestId('edit-lite-source-kind')
}

async function editFirstLine(): Promise<void> {
  await userEvent.click(screen.getByRole('button', { name: /^1 %n/ }))
  await userEvent.type(await screen.findByLabelText('Number'), 'a')
}

test('the application renders the split view from the new endpoints', async () => {
  const fakeApi = createApiFakeApi()
  const appDriver = new AppDriver(fakeApi.client)
    .withSession()
    .withPath(`${editLitePath}?variant=split`)
    .render()

  await appDriver.waitForText('lite preview')
  const editor = await loadedEditor('1')

  expect(
    screen.getByRole('heading', { name: editLiteHeading }),
  ).toBeInTheDocument()
  appDriver.breadcrumbs.expectCrumbs(['Corpus', 'Edit (lite preview)'])
  expect(screen.getByRole('link', { name: 'C · Split view' })).toHaveAttribute(
    'aria-current',
    'page',
  )
  expect(options()).toHaveLength(lines.length)
  expect(within(editor).getByLabelText('Number')).toHaveValue('1')
  expect(sourceKind()).toHaveTextContent('api')
  expect(
    screen.queryByText(legacyNotice, { exact: false }),
  ).not.toBeInTheDocument()
  fakeApi.verifyExpectations()
})

test('the route falls back to the existing endpoints', async () => {
  const fakeApi = createLegacyFakeApi()
  await renderLoadedEditLiteRoute({ fakeApi })

  expect(sourceKind()).toHaveTextContent('legacy')
  expect(screen.getByText(legacyNotice, { exact: false })).toBeInTheDocument()
  expect(screen.getByTestId('edit-lite-line-count')).toHaveTextContent('2')
  expect(screen.getByTestId('edit-lite-diagnostics')).toHaveTextContent('0')
  expect(countRequests(fakeApi, outlineUrl)).toBe(1)
  fakeApi.verifyExpectations()
})

test('a legacy source previews the request instead of saving', async () => {
  const fakeApi = createLegacyFakeApi()
  await renderLoadedEditLiteRoute({ fakeApi, search: '?source=legacy' })
  await editFirstLine()

  await userEvent.click(screen.getByRole('button', { name: 'Save line' }))
  const body = within(
    screen.getByRole('dialog', { name: 'Request preview' }),
  ).getByLabelText('Request body')

  expect(JSON.parse(body.textContent ?? '')).toMatchObject({
    edited: [{ index: 0, line: { number: '1a' } }],
  })
  expect(countRequests(fakeApi, outlineUrl)).toBe(0)
  expect(fakeApi.client.postJson).not.toHaveBeenCalled()
})

test('a forced api source does not fall back', async () => {
  const fakeApi = createLegacyFakeApi()
  renderEditLiteRoute({ fakeApi, search: '?source=api' })

  expect(await screen.findByRole('alert')).toHaveTextContent(outlineUrl)
  expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  expect(countRequests(fakeApi, snapshotUrl)).toBe(0)
})

test('an api source saves the edited line and shows the new outline', async () => {
  const savedLines = [setLineNumber(lines[0], '1a'), ...lines.slice(1)]
  const fakeApi = createApiFakeApi().expectUpdateEditedLines(
    editLiteChapterId,
    toLineEditsDto(0, savedLines[0]),
    buildEditLiteOutline(savedLines),
  )
  await renderLoadedEditLiteRoute({ fakeApi })
  await editFirstLine()

  await userEvent.click(screen.getByRole('button', { name: 'Save line' }))

  expect(
    await screen.findByRole('button', { name: /^1a %n/ }),
  ).toBeInTheDocument()
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(screen.getAllByRole('alert')).toHaveLength(1)
  expect(fakeApi.client.postJson).toHaveBeenCalledTimes(1)
  fakeApi.verifyExpectations()
})

test('a reader with an api source previews the request instead of saving', async () => {
  const fakeApi = createApiFakeApi()
  await renderLoadedEditLiteRoute({
    fakeApi,
    search: '?source=api',
    session: guestSession,
  })
  await editFirstLine()

  await userEvent.click(screen.getByRole('button', { name: 'Save line' }))

  expect(
    screen.getByRole('dialog', { name: 'Request preview' }),
  ).toBeInTheDocument()
  expect(fakeApi.client.postJson).not.toHaveBeenCalled()
  expect(countRequests(fakeApi, snapshotUrl)).toBe(0)
})
