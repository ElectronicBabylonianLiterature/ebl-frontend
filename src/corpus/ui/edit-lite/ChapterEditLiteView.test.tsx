import { screen, within } from '@testing-library/react'
import MemorySession, { guestSession } from 'auth/Session'
import TextService from 'corpus/application/TextService'
import {
  legacyNotice,
  previewNotice,
} from 'corpus/ui/edit-lite/ChapterEditLiteView'
import {
  classicEditPath,
  countTextRequests,
  createEditLiteFakeApi,
  createSourceMock,
  editLiteChapterId,
  editLiteHeading,
  mockEditSource,
  renderEditLiteRoute,
  renderLoadedEditLiteRoute,
} from 'corpus/ui/edit-lite/ChapterEditLiteView.testSupport'
import {
  buildEditLiteLines,
  buildEditLiteOutline,
  createFakeChapterEditSource,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import { breadcrumbs } from 'test-support/appDriverHelpers'

jest.mock('editor/Editor', () =>
  jest.requireActual('editor/Editor.testSupport'),
)
jest.mock('corpus/application/edit-lite/createChapterEditSource')

function metric(testId: string): HTMLElement {
  return within(screen.getByTestId('edit-lite-performance')).getByTestId(testId)
}

function notice(): HTMLElement {
  return screen.getByText(previewNotice, { exact: false })
}

afterEach(() => {
  jest.restoreAllMocks()
})

test('shows a spinner until the text and the source are loaded', async () => {
  const fakeApi = createEditLiteFakeApi()
  mockEditSource()
  renderEditLiteRoute({ fakeApi })

  expect(screen.getByLabelText('Spinner')).toBeInTheDocument()
  expect(screen.queryByRole('heading')).not.toBeInTheDocument()

  expect(
    await screen.findByRole('heading', { name: editLiteHeading }),
  ).toHaveTextContent(
    'Edit Poem of Creation Standard Babylonian I lite preview',
  )
  expect(screen.queryByLabelText('Spinner')).not.toBeInTheDocument()
  fakeApi.verifyExpectations()
  expect(countTextRequests(fakeApi)).toBe(1)
})

test('shows the breadcrumbs of the chapter', async () => {
  mockEditSource()
  await renderLoadedEditLiteRoute()

  breadcrumbs.expectCrumbs(['eBL', 'Corpus', 'I.2 Poem of Creation'])
  breadcrumbs.expectCrumb('Chapter Standard Babylonian I', '/corpus/L/1/2/SB/I')
  expect(
    within(breadcrumbs.getBreadcrumbs()).getByText('Edit (lite preview)'),
  ).toHaveAttribute('aria-current', 'page')
})

test('creates the source for the chapter of the route', async () => {
  mockEditSource()
  await renderLoadedEditLiteRoute()

  expect(createSourceMock).toHaveBeenCalledTimes(1)
  expect(createSourceMock).toHaveBeenCalledWith({
    textService: expect.any(TextService),
    id: editLiteChapterId,
    mode: 'auto',
    canWrite: true,
    signal: expect.any(AbortSignal),
  })
})

test.each([
  ['a guest', guestSession, false],
  ['a reader', new MemorySession(['read:texts']), false],
  ['a writer', new MemorySession(['write:texts']), true],
])(
  'tells the source whether %s may write',
  async (_name, session, canWrite) => {
    mockEditSource()
    await renderLoadedEditLiteRoute({ session })

    expect(createSourceMock).toHaveBeenCalledWith(
      expect.objectContaining({ canWrite }),
    )
  },
)

test.each([
  ['?source=legacy', 'legacy'],
  ['?source=api', 'api'],
  ['?source=auto', 'auto'],
  ['?source=mongo', 'auto'],
])('requests the source mode of "%s"', async (search, mode) => {
  mockEditSource()
  await renderLoadedEditLiteRoute({ search })

  expect(createSourceMock).toHaveBeenCalledWith(
    expect.objectContaining({ mode }),
  )
})

test('explains the preview and links to the classic edit page', async () => {
  mockEditSource({ kind: 'api' })
  await renderLoadedEditLiteRoute()

  expect(notice()).toHaveAttribute('role', 'alert')
  expect(notice()).not.toHaveTextContent(legacyNotice)
  expect(within(notice()).queryByRole('button')).not.toBeInTheDocument()
  expect(
    within(notice()).getByRole('link', { name: 'Open the classic edit page' }),
  ).toHaveAttribute('href', classicEditPath)
})

test('says that a legacy source is read from existing endpoints', async () => {
  mockEditSource({ kind: 'legacy' })
  await renderLoadedEditLiteRoute()

  expect(notice()).toHaveTextContent(`${previewNotice} `)
  expect(notice()).toHaveTextContent(legacyNotice)
  expect(metric('edit-lite-source-kind')).toHaveTextContent('legacy')
})

test('reports the source, its size and its diagnostics', async () => {
  const lines = buildEditLiteLines(12)
  mockEditSource({ lines, diagnostics: ['Unknown siglum X', 'Odd row'] })
  await renderLoadedEditLiteRoute()

  expect(metric('edit-lite-source-kind')).toHaveTextContent('api')
  expect(metric('edit-lite-line-count')).toHaveTextContent('12')
  expect(metric('edit-lite-manuscript-count')).toHaveTextContent('2')
  expect(metric('edit-lite-diagnostics')).toHaveTextContent('2')
  expect(
    Number(metric('edit-lite-dom-nodes').textContent),
  ).toBeGreaterThanOrEqual(screen.getAllByRole('listitem').length)
  expect(metric('edit-lite-ace-editors')).toHaveTextContent('0')
})

test('measures how long creating the source took', async () => {
  const source = createFakeChapterEditSource()
  let now = 1000
  jest.spyOn(performance, 'now').mockImplementation(() => now)
  createSourceMock.mockImplementation(() => {
    now += 2400
    return Promise.resolve({ source, outline: buildEditLiteOutline() })
  })
  await renderLoadedEditLiteRoute()

  expect(metric('edit-lite-load-ms')).toHaveAttribute(
    'data-milliseconds',
    '2400',
  )
  expect(metric('edit-lite-load-ms')).toHaveTextContent(/^2\.4 s$/)
})

test('shows the error when the source cannot be created', async () => {
  createSourceMock.mockRejectedValue(new Error('No source is available.'))
  renderEditLiteRoute()

  expect(await screen.findByRole('alert')).toHaveTextContent(
    'No source is available.',
  )
  expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  expect(screen.queryByLabelText('Spinner')).not.toBeInTheDocument()
})

test('shows the error when the text cannot be loaded', async () => {
  mockEditSource()
  const fakeApi = createEditLiteFakeApi()
  fakeApi.client.fetchJson.mockRejectedValue(new Error('The text is gone.'))
  renderEditLiteRoute({ fakeApi })

  expect(await screen.findByRole('alert')).toHaveTextContent(
    'The text is gone.',
  )
  expect(screen.queryByRole('heading')).not.toBeInTheDocument()
})
