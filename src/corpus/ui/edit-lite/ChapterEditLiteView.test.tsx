import { screen, within } from '@testing-library/react'
import MemorySession, { guestSession } from 'auth/Session'
import TextService from 'corpus/application/TextService'
import { readOnlyNotice } from 'corpus/ui/edit-lite/ChapterEditLiteView'
import {
  countTextRequests,
  createEditLiteFakeApi,
  createSourceMock,
  editLiteChapterId,
  editLiteHeading,
  mockEditSource,
  renderEditLiteRoute,
  renderLoadedEditLiteRoute,
  waitForLoadedLines,
} from 'corpus/ui/edit-lite/ChapterEditLiteView.testSupport'
import { breadcrumbs } from 'test-support/appDriverHelpers'

jest.mock('editor/Editor', () =>
  jest.requireActual('editor/Editor.testSupport'),
)
jest.mock('corpus/application/edit-lite/createChapterEditSource')

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
  ).toHaveTextContent(/^Edit Poem of Creation Standard Babylonian I$/)
  await waitForLoadedLines()
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
    within(breadcrumbs.getBreadcrumbs()).getByText('Edit', { exact: true }),
  ).toHaveAttribute('aria-current', 'page')
})

test('creates the source for the chapter of the route', async () => {
  mockEditSource()
  await renderLoadedEditLiteRoute()

  expect(createSourceMock).toHaveBeenCalledTimes(1)
  expect(createSourceMock).toHaveBeenCalledWith({
    textService: expect.any(TextService),
    id: editLiteChapterId,
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

test.each(['?source=legacy', '?source=api', '?source=auto'])(
  'ignores the parameter "%s"',
  async (search) => {
    mockEditSource()
    await renderLoadedEditLiteRoute({ search })

    expect(createSourceMock).toHaveBeenCalledWith({
      textService: expect.any(TextService),
      id: editLiteChapterId,
      canWrite: true,
      signal: expect.any(AbortSignal),
    })
  },
)

test('shows no preview aids', async () => {
  mockEditSource()
  await renderLoadedEditLiteRoute()

  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  expect(screen.queryByText(/preview/i)).not.toBeInTheDocument()
  expect(screen.queryByText(/classic/i)).not.toBeInTheDocument()
  expect(
    screen.queryByRole('region', { name: 'Performance' }),
  ).not.toBeInTheDocument()
  expect(
    screen.queryByRole('button', { name: 'Preview request' }),
  ).not.toBeInTheDocument()
  expect(
    screen.queryByRole('button', { name: 'Refresh' }),
  ).not.toBeInTheDocument()
})

test('says that the page is read-only without write permission', async () => {
  mockEditSource()
  await renderLoadedEditLiteRoute({ session: guestSession })

  expect(screen.getByRole('alert')).toHaveTextContent(readOnlyNotice)
  expect(readOnlyNotice).toBe(
    'Editing needs permission to edit texts, so this page is read-only.',
  )
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
