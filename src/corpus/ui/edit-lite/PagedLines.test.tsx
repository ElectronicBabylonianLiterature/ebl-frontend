import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import _ from 'lodash'
import EditLiteContext, {
  EditLiteContextValue,
} from 'corpus/ui/edit-lite/EditLiteContext'
import {
  buildEditLiteLines,
  buildEditLiteOutline,
  createFakeChapterEditSource,
  editLiteManuscripts,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import * as editLiteReducer from 'corpus/ui/edit-lite/editLiteReducer'
import { button } from 'corpus/ui/edit-lite/LineEditContainer.testSupport'
import PagedLines from 'corpus/ui/edit-lite/PagedLines'
import {
  changePage,
  changePageSize,
  headings,
  headingsOnPage,
  lineCount,
  lineEditor,
  lineHeading,
  renderLoadedPagedLines,
} from 'corpus/ui/edit-lite/PagedLines.testSupport'

jest.mock('editor/Editor', () =>
  jest.requireActual('editor/Editor.testSupport'),
)

afterEach(() => {
  jest.restoreAllMocks()
})

test('shows the first page and loads its lines with one request', async () => {
  const { source } = await renderLoadedPagedLines()

  expect(screen.getByText('Lines 1–10 of 62')).toBeVisible()
  expect(headingsOnPage()).toEqual(headings(1, 10))
  expect(screen.getAllByLabelText('Number')).toHaveLength(10)
  expect(within(lineEditor(10)).getByLabelText('Number')).toHaveValue('10')
  expect(source.loadLines.mock.calls).toEqual([[0, 10]])
  expect(button('Previous')).toBeDisabled()
  expect(button('Next')).toBeEnabled()
})

test('next and previous change the page and load only new lines', async () => {
  const { source } = await renderLoadedPagedLines()
  await changePage('Next')

  expect(screen.getByText('Lines 11–20 of 62')).toBeVisible()
  expect(headingsOnPage()).toEqual(headings(11, 20))
  expect(within(lineEditor(11)).getByLabelText('Number')).toHaveValue('11')
  expect(source.loadLines.mock.calls).toEqual([
    [0, 10],
    [10, 10],
  ])

  await changePage('Previous')

  expect(screen.getByText('Lines 1–10 of 62')).toBeVisible()
  expect(headingsOnPage()).toEqual(headings(1, 10))
  expect(source.loadLines).toHaveBeenCalledTimes(2)
})

test('the last page holds the remaining lines', async () => {
  const { source } = await renderLoadedPagedLines({ initialLine: 61 })

  expect(screen.getByText('Lines 61–62 of 62')).toBeVisible()
  expect(headingsOnPage()).toEqual(headings(61, 62))
  expect(source.loadLines.mock.calls).toEqual([[60, 2]])
  expect(button('Previous')).toBeEnabled()
  expect(button('Next')).toBeDisabled()
})

test('a larger page size loads the lines that are new on the page', async () => {
  const { source } = await renderLoadedPagedLines()
  await changePageSize(25)

  expect(screen.getByText('Lines 1–25 of 62')).toBeVisible()
  expect(headingsOnPage()).toEqual(headings(1, 25))
  expect(source.loadLines.mock.calls).toEqual([
    [0, 10],
    [10, 15],
  ])
})

test('a smaller page size stays at the same place in the chapter', async () => {
  const { source } = await renderLoadedPagedLines({ initialPageSize: 25 })
  await changePage('Next')
  await changePageSize(10)

  expect(screen.getByText('Lines 21–30 of 62')).toBeVisible()
  expect(headingsOnPage()).toEqual(headings(21, 30))
  expect(source.loadLines.mock.calls).toEqual([
    [0, 25],
    [25, 25],
  ])
})

test.each([
  [25, 'Lines 1–25 of 62', 25],
  [50, 'Lines 1–50 of 62', 50],
  [7, 'Lines 1–10 of 62', 10],
  [undefined, 'Lines 1–10 of 62', 10],
])(
  'an initial page size of %s shows "%s"',
  async (
    initialPageSize: number | undefined,
    range: string,
    pageSize: number,
  ) => {
    const { source } = await renderLoadedPagedLines({ initialPageSize })

    expect(screen.getByText(range)).toBeVisible()
    expect(
      screen.getByRole('combobox', { name: 'Lines per page' }),
    ).toHaveValue(`${pageSize}`)
    expect(source.loadLines.mock.calls).toEqual([[0, pageSize]])
  },
)

test('requests a page once before its lines ask for themselves', async () => {
  const actions = {
    ensureLines: jest.fn<void, [number, number]>(),
    changeLine: jest.fn(),
    resetLine: jest.fn(),
    saveLine: jest.fn(),
  }
  const context: EditLiteContextValue = {
    kind: 'api',
    canSave: true,
    manuscripts: editLiteManuscripts,
    actions,
    describeSave: jest.fn(),
  }
  const state = editLiteReducer.createEditLiteState(
    buildEditLiteOutline(buildEditLiteLines(30)),
  )
  render(
    <EditLiteContext.Provider value={context}>
      <PagedLines state={state} initialPageSize={25} />
    </EditLiteContext.Provider>,
  )
  const pageRequests = (): number[][] =>
    actions.ensureLines.mock.calls.filter(([, limit]) => limit === 25)

  expect(actions.ensureLines.mock.calls[0]).toEqual([0, 25])
  expect(pageRequests()).toEqual([[0, 25]])

  await userEvent.click(button('Next'))

  expect(pageRequests()).toEqual([
    [0, 25],
    [25, 25],
  ])
})

test('a draft survives leaving and returning to its page', async () => {
  const { source, getState } = await renderLoadedPagedLines()
  await userEvent.type(within(lineEditor(1)).getByLabelText('Number'), 'a')

  expect(lineHeading('1 edited')).toBeVisible()
  expect(screen.getAllByText('edited')).toHaveLength(1)

  await changePage('Next')

  expect(screen.queryByText('edited')).not.toBeInTheDocument()

  await changePage('Previous')

  expect(lineHeading('1 edited')).toBeVisible()
  expect(within(lineEditor(1)).getByLabelText('Number')).toHaveValue('1a')
  expect(getState().lines[0].draft?.number).toBe('1a')
  expect(source.loadLines).toHaveBeenCalledTimes(2)
})

test('typing in a line does not render the other lines of the page', async () => {
  const isLineDirty = jest.spyOn(editLiteReducer, 'isLineDirty')
  await renderLoadedPagedLines()
  isLineDirty.mockClear()
  await userEvent.type(within(lineEditor(2)).getByLabelText('Number'), 'b')

  expect(
    _.uniq(
      isLineDirty.mock.calls.map(([lineState]) => lineState?.original?.number),
    ),
  ).toEqual(['2'])
})

test('shows which lines failed to load and retries one of them', async () => {
  const source = createFakeChapterEditSource({
    lines: buildEditLiteLines(lineCount),
  })
  source.loadLines.mockRejectedValueOnce(new Error('Network error'))
  await renderLoadedPagedLines({ source })

  expect(screen.getAllByRole('alert')).toHaveLength(10)
  expect(within(lineEditor(3)).getByRole('alert')).toHaveTextContent(
    'Network error',
  )

  await userEvent.click(within(lineEditor(3)).getByRole('button'))

  expect(await within(lineEditor(3)).findByLabelText('Number')).toHaveValue('3')
  expect(screen.getAllByRole('alert')).toHaveLength(9)
  expect(source.loadLines.mock.calls).toEqual([
    [0, 10],
    [2, 1],
  ])
})

test('a chapter without lines has no page', async () => {
  const { source } = await renderLoadedPagedLines({ lines: [] })

  expect(screen.getByText('No lines')).toBeVisible()
  expect(screen.queryByRole('list')).not.toBeInTheDocument()
  expect(button('Previous')).toBeDisabled()
  expect(button('Next')).toBeDisabled()
  expect(source.loadLines).not.toHaveBeenCalled()
})
