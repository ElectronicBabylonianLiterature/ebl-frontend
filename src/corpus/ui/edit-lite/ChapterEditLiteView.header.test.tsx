import { screen, waitFor, within } from '@testing-library/react'
import { guestSession } from 'auth/Session'
import {
  createSourceMock,
  mockEditSource,
  renderLoadedEditLiteRoute,
  writerSession,
} from 'corpus/ui/edit-lite/ChapterEditLiteView.testSupport'
import { readOnlyNotice } from 'corpus/ui/edit-lite/ChapterEditLiteView'

jest.mock('editor/Editor', () =>
  jest.requireActual('editor/Editor.testSupport'),
)
jest.mock('corpus/application/edit-lite/createChapterEditSource')

afterEach(() => {
  jest.restoreAllMocks()
})

test('links to every chapter of the text', async () => {
  mockEditSource()
  await renderLoadedEditLiteRoute()

  const navigation = screen.getByRole('navigation', { name: 'Chapters' })
  expect(
    within(navigation)
      .getAllByRole('link')
      .map((link) => [link.textContent, link.getAttribute('href')]),
  ).toEqual([
    ['Standard Babylonian I', '/corpus/L/1/2/SB/I'],
    ['Standard Babylonian II', '/corpus/L/1/2/SB/II'],
  ])
})

test('shows the details of the chapter', async () => {
  mockEditSource()
  await renderLoadedEditLiteRoute()

  const values = screen
    .getAllByRole('definition')
    .map((value) => value.textContent)
  expect(
    screen
      .getAllByRole('term')
      .map((term, index) => [term.textContent, values[index]]),
  ).toEqual([
    ['Classification', 'Ancient'],
    ['Stage', 'Standard Babylonian'],
    ['Version', ''],
    ['Name', 'I'],
  ])
})

test('reloads when the permission to write changes', async () => {
  mockEditSource()
  const view = await renderLoadedEditLiteRoute({ session: guestSession })
  expect(screen.getByRole('alert')).toHaveTextContent(readOnlyNotice)

  view.changeSession(writerSession)

  await waitFor(() =>
    expect(createSourceMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ canWrite: true }),
    ),
  )
  await waitFor(() =>
    expect(screen.queryByText(readOnlyNotice)).not.toBeInTheDocument(),
  )
})
