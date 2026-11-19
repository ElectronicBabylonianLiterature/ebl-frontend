import React from 'react'
import { screen, waitFor, within } from '@testing-library/react'
import { createLine } from 'corpus/domain/line'
import {
  buildEditLiteLines,
  buildEditLiteOutline,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import { createEditLiteState } from 'corpus/ui/edit-lite/editLiteReducer'
import PagedLines, { findLineIndex } from 'corpus/ui/edit-lite/PagedLines'
import {
  changePage,
  changePageSize,
  goToLine,
  lineHeading,
  queryTargetLine,
  renderLoadedPagedLines,
  renderPagedLines,
  waitForLoadedPage,
} from 'corpus/ui/edit-lite/PagedLines.testSupport'

jest.mock('editor/Editor', () =>
  jest.requireActual('editor/Editor.testSupport'),
)

let scrollIntoView: jest.Mock

async function expectScrolledTo(
  element: HTMLElement,
  scrollCount = 1,
): Promise<void> {
  await waitFor(() => expect(scrollIntoView).toHaveBeenCalledTimes(scrollCount))
  expect(scrollIntoView.mock.instances[scrollCount - 1]).toBe(element)
  expect(scrollIntoView).toHaveBeenLastCalledWith({
    block: 'start',
    behavior: 'instant',
  })
}

function targetHeading(): HTMLElement {
  return within(
    screen.getByRole('listitem', { current: 'location' }),
  ).getByRole('heading')
}

beforeEach(() => {
  scrollIntoView = jest.fn()
  window.HTMLElement.prototype.scrollIntoView = scrollIntoView
})

afterEach(() => {
  jest.restoreAllMocks()
})

test('the initial line selects its page and is scrolled into view', async () => {
  const { source } = await renderLoadedPagedLines({ initialLine: 36 })

  expect(screen.getByText('Lines 31–40 of 62')).toBeVisible()
  expect(source.loadLines.mock.calls).toEqual([[30, 10]])
  expect(targetHeading()).toBe(lineHeading('37'))
  await expectScrolledTo(lineHeading('37'))
  expect(lineHeading('37')).not.toHaveFocus()
})

test('scrolls to the initial line only after its page is loaded', async () => {
  const view = renderPagedLines({ initialLine: 36 })

  expect(screen.getAllByText('Loading line...')).toHaveLength(10)
  expect(scrollIntoView).not.toHaveBeenCalled()

  await waitForLoadedPage()

  await expectScrolledTo(lineHeading('37'))
  expect(view.source.loadLines).toHaveBeenCalledTimes(1)
})

test.each([
  [-3, 'Lines 1–10 of 62'],
  [Number.NaN, 'Lines 1–10 of 62'],
  [36.5, 'Lines 31–40 of 62'],
  [500, 'Lines 61–62 of 62'],
])(
  'an initial line of %s shows "%s" without selecting a line',
  async (initialLine: number, range: string) => {
    await renderLoadedPagedLines({ initialLine })

    expect(screen.getByText(range)).toBeVisible()
    expect(queryTargetLine()).not.toBeInTheDocument()
    expect(scrollIntoView).not.toHaveBeenCalled()
  },
)

test('go to line shows the page of the line and focuses its heading', async () => {
  const { source } = await renderLoadedPagedLines()
  await goToLine('37')

  expect(screen.getByText('Lines 31–40 of 62')).toBeVisible()
  expect(source.loadLines.mock.calls).toEqual([
    [0, 10],
    [30, 10],
  ])
  await expectScrolledTo(lineHeading('37'))
  expect(lineHeading('37')).toHaveFocus()
  expect(targetHeading()).toBe(lineHeading('37'))
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})

test('go to line finds a line on the current page', async () => {
  const { source } = await renderLoadedPagedLines()
  await goToLine('4')

  await expectScrolledTo(lineHeading('4'))
  expect(lineHeading('4')).toHaveFocus()
  expect(screen.getByText('Lines 1–10 of 62')).toBeVisible()
  expect(source.loadLines).toHaveBeenCalledTimes(1)
})

test('go to line accepts a line number label', async () => {
  const lines = buildEditLiteLines(30).map((line, index) =>
    index === 14 ? { ...line, number: "12a'" } : line,
  )
  await renderLoadedPagedLines({ lines })
  await goToLine('12A′.')

  expect(screen.getByText('Lines 11–20 of 30')).toBeVisible()
  await expectScrolledTo(lineHeading("12a'"))
  expect(lineHeading("12a'")).toHaveFocus()
})

test('go to line reports a line number that does not exist', async () => {
  const { source } = await renderLoadedPagedLines()
  await goToLine('99')

  expect(screen.getByRole('alert')).toHaveTextContent('Line 99 was not found.')
  expect(screen.getByText('Lines 1–10 of 62')).toBeVisible()
  expect(queryTargetLine()).not.toBeInTheDocument()
  expect(source.loadLines).toHaveBeenCalledTimes(1)
  expect(scrollIntoView).not.toHaveBeenCalled()
})

test.each([
  ['11', 0],
  ['12a', 1],
  ['12A', 1],
  [' 12a. ', 1],
  ["6'", 2],
  ['6′', 2],
  ['6’', 2],
  ['6ʾ', 2],
  ['a+1', 3],
  ['12', -1],
  ['', -1],
])(
  'the line number "%s" is at position %s',
  (lineNumber: string, index: number) => {
    const { lines } = buildEditLiteOutline(
      ['11', '12a', "6'", 'A+1'].map((number) => createLine({ number })),
    )

    expect(findLineIndex(lines, lineNumber)).toBe(index)
  },
)

test('a page size change keeps the selected line and scrolls back to it', async () => {
  await renderLoadedPagedLines({ initialLine: 36 })
  await expectScrolledTo(lineHeading('37'))
  await changePageSize(25)

  expect(screen.getByText('Lines 26–50 of 62')).toBeVisible()
  expect(targetHeading()).toBe(lineHeading('37'))
  await expectScrolledTo(lineHeading('37'), 2)
  expect(lineHeading('37')).not.toHaveFocus()
})

test('a page size change scrolls to the line the page started with', async () => {
  await renderLoadedPagedLines()
  await changePage('Next')
  await changePageSize(25)

  expect(screen.getByText('Lines 1–25 of 62')).toBeVisible()
  expect(queryTargetLine()).not.toBeInTheDocument()
  await expectScrolledTo(lineHeading('11'))
})

test('a page size change at the start of a page does not scroll', async () => {
  await renderLoadedPagedLines()
  await changePageSize(25)

  expect(screen.getByText('Lines 1–25 of 62')).toBeVisible()
  expect(scrollIntoView).not.toHaveBeenCalled()
})

test('changing the page does not scroll while its top is in view', async () => {
  await renderLoadedPagedLines()
  await goToLine('4')
  scrollIntoView.mockClear()
  await changePage('Next')

  expect(screen.getByText('Lines 11–20 of 62')).toBeVisible()
  expect(queryTargetLine()).not.toBeInTheDocument()
  expect(scrollIntoView).not.toHaveBeenCalled()
})

test('changing the page scrolls back to its top when that is out of view', async () => {
  await renderLoadedPagedLines()
  jest
    .spyOn(Element.prototype, 'getBoundingClientRect')
    .mockReturnValue({ top: -300 } as DOMRect)
  await changePage('Next')

  await expectScrolledTo(screen.getByTestId('edit-lite-paged'))
  expect(screen.getByText('Lines 11–20 of 62')).toBeVisible()
})

test('moves the focus where scrolling is not supported', async () => {
  Reflect.deleteProperty(window.HTMLElement.prototype, 'scrollIntoView')
  await renderLoadedPagedLines()
  await goToLine('37')

  await waitFor(() => expect(lineHeading('37')).toHaveFocus())
  expect(scrollIntoView).not.toHaveBeenCalled()
})

test('a chapter without lines has nothing to scroll to', async () => {
  await renderLoadedPagedLines({ lines: [], initialLine: 0 })
  await changePageSize(25)

  expect(screen.getByText('No lines')).toBeVisible()
  expect(scrollIntoView).not.toHaveBeenCalled()
})

test('a chapter that lost its lines has nothing to scroll to', async () => {
  const view = await renderLoadedPagedLines()
  await changePage('Next')
  view.rerender(
    <PagedLines state={createEditLiteState(buildEditLiteOutline([]))} />,
  )
  await changePageSize(25)

  expect(screen.getByText('No lines')).toBeVisible()
  expect(scrollIntoView).not.toHaveBeenCalled()
})
