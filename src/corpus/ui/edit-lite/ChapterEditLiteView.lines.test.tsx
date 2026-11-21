import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  countTextRequests,
  createEditLiteFakeApi,
  createSourceMock,
  editFirstLine,
  editLitePath,
  mockEditSource,
  renderLoadedEditLiteRoute,
  secondEditLiteChapterId,
  secondEditLitePath,
} from 'corpus/ui/edit-lite/ChapterEditLiteView.testSupport'
import { buildEditLiteLines } from 'corpus/ui/edit-lite/editLite.testSupport'
import {
  editors,
  loadedEditor,
  options,
  selectedOptions,
} from 'corpus/ui/edit-lite/SplitLines.testSupport'

jest.mock('editor/Editor', () =>
  jest.requireActual('editor/Editor.testSupport'),
)
jest.mock('corpus/application/edit-lite/createChapterEditSource')

function expectSelectedLine(lineNumber: string): void {
  expect(selectedOptions()).toHaveLength(1)
  expect(selectedOptions()[0]).toHaveTextContent(new RegExp(`^${lineNumber}%n`))
}

test('shows the split view with the first line selected', async () => {
  const source = mockEditSource()
  await renderLoadedEditLiteRoute()
  const editor = await loadedEditor('1')

  expect(screen.getByRole('tab', { name: 'Lines' })).toHaveAttribute(
    'aria-selected',
    'true',
  )
  expect(options()).toHaveLength(3)
  expectSelectedLine('1')
  expect(within(editor).getByLabelText('Number')).toHaveValue('1')
  expect(editors()).toHaveLength(1)
  expect(source.loadLines.mock.calls).toEqual([[0, 2]])
})

test.each([
  ['?line=14', '14'],
  ['?line=%2014.%20', '14'],
  ['?source=api&line=30', '30'],
])('selects the line of "%s"', async (search, lineNumber) => {
  mockEditSource({ lines: buildEditLiteLines(30) })
  await renderLoadedEditLiteRoute({ search })
  const editor = await loadedEditor(lineNumber)

  expect(within(editor).getByLabelText('Number')).toHaveValue(lineNumber)
  expectSelectedLine(lineNumber)
})

test('loads the selected line with its neighbours only', async () => {
  const source = mockEditSource({ lines: buildEditLiteLines(30) })
  await renderLoadedEditLiteRoute({ search: '?line=14' })
  await loadedEditor('14')

  expect(source.loadLines.mock.calls).toEqual([[12, 3]])
})

test.each(['?line=99', '?line=', '?line=1x'])(
  'selects the first line for "%s"',
  async (search) => {
    const source = mockEditSource()
    await renderLoadedEditLiteRoute({ search })
    await loadedEditor('1')

    expectSelectedLine('1')
    expect(source.loadLines.mock.calls).toEqual([[0, 2]])
  },
)

test.each([
  ['?variant=accordion&size=25', '1'],
  ['?variant=pages&size=50&line=2', '2'],
  ['?variant=score&debug=1&line=3', '3'],
])(
  'renders the split view for the leftover parameters of "%s"',
  async (search, lineNumber) => {
    mockEditSource()
    await renderLoadedEditLiteRoute({ search })
    const editor = await loadedEditor(lineNumber)

    expect(options()).toHaveLength(3)
    expectSelectedLine(lineNumber)
    expect(within(editor).getByLabelText('Number')).toHaveValue(lineNumber)
    expect(editors()).toHaveLength(1)
    expect(createSourceMock).toHaveBeenCalledTimes(1)
    expect(createSourceMock).toHaveBeenCalledWith(
      expect.objectContaining({ mode: 'auto' }),
    )
  },
)

test.each([
  ['the line', `${editLitePath}?line=2`],
  ['a parameter it does not know', `${editLitePath}?variant=pages&size=25`],
])(
  'keeps the loaded data and an edited draft when only %s changes',
  async (_name, link) => {
    const fakeApi = createEditLiteFakeApi()
    const source = mockEditSource()
    await renderLoadedEditLiteRoute({ fakeApi, links: [link] })
    await editFirstLine()

    await userEvent.click(screen.getByRole('link', { name: link }))
    const editor = await loadedEditor('1')

    expect(within(editor).getByLabelText('Number')).toHaveValue('1a')
    expect(within(selectedOptions()[0]).getByText('edited')).toBeInTheDocument()
    expect(createSourceMock).toHaveBeenCalledTimes(1)
    expect(source.loadOutline).not.toHaveBeenCalled()
    expect(countTextRequests(fakeApi)).toBe(1)
    expect(source.loadLines.mock.calls).toEqual([[0, 2]])
  },
)

test('counts the document again when lines have loaded', async () => {
  const countedElements = (): number =>
    Number(screen.getByTestId('edit-lite-dom-nodes').textContent)
  const presentElements = (): number =>
    (document.documentElement.outerHTML.match(/<[a-z]/gi) ?? []).length
  mockEditSource({ lines: buildEditLiteLines(30) })
  await renderLoadedEditLiteRoute()
  await loadedEditor('1')
  const firstCount = countedElements()

  expect(firstCount).toBe(presentElements())

  await userEvent.click(options()[9])
  await loadedEditor('10')

  expect(countedElements()).toBe(presentElements())
  expect(countedElements()).not.toBe(firstCount)
})

test('loads again and drops the drafts when the source mode changes', async () => {
  const legacyLink = `${editLitePath}?source=legacy`
  const fakeApi = createEditLiteFakeApi()
  mockEditSource()
  await renderLoadedEditLiteRoute({ fakeApi, links: [legacyLink] })
  await editFirstLine()
  mockEditSource({ kind: 'legacy' })

  await userEvent.click(screen.getByRole('link', { name: legacyLink }))

  expect(await screen.findByTestId('edit-lite-source-kind')).toHaveTextContent(
    'legacy',
  )
  expect(createSourceMock).toHaveBeenCalledTimes(2)
  expect(createSourceMock).toHaveBeenLastCalledWith(
    expect.objectContaining({ mode: 'legacy' }),
  )
  expect(countTextRequests(fakeApi)).toBe(2)
  expect(within(await loadedEditor('1')).getByLabelText('Number')).toHaveValue(
    '1',
  )
  expect(screen.queryByText('edited')).not.toBeInTheDocument()
})

test('loads again when the chapter changes', async () => {
  mockEditSource()
  await renderLoadedEditLiteRoute({ links: [secondEditLitePath] })
  await editFirstLine()
  mockEditSource({ lines: buildEditLiteLines(5) })

  await userEvent.click(screen.getByRole('link', { name: secondEditLitePath }))

  expect(
    await screen.findByRole('heading', {
      name: /^Edit Poem of Creation Standard Babylonian II /,
    }),
  ).toBeInTheDocument()
  expect(createSourceMock).toHaveBeenCalledTimes(2)
  expect(createSourceMock).toHaveBeenLastCalledWith(
    expect.objectContaining({ id: secondEditLiteChapterId }),
  )
  expect(screen.getByTestId('edit-lite-line-count')).toHaveTextContent('5')
  expect(within(await loadedEditor('1')).getByLabelText('Number')).toHaveValue(
    '1',
  )
  expect(options()).toHaveLength(5)
  expect(screen.queryByText('edited')).not.toBeInTheDocument()
})
