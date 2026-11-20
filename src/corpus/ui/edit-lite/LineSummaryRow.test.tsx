import React from 'react'
import { render, screen } from '@testing-library/react'
import { LineOutline } from 'corpus/application/edit-lite/chapterOutline'
import { buildEditLiteOutline } from 'corpus/ui/edit-lite/editLite.testSupport'
import * as lineSummary from 'corpus/ui/edit-lite/lineSummary'
import LineSummaryRow from 'corpus/ui/edit-lite/LineSummaryRow'

const [firstLine, secondLine]: readonly LineOutline[] =
  buildEditLiteOutline().lines

afterEach(() => {
  jest.restoreAllMocks()
})

test('shows the number, reconstruction, translation and manuscripts', () => {
  render(<LineSummaryRow line={firstLine} />)

  expect(screen.getByText('1')).toBeVisible()
  expect(screen.getByText('%n enūma | eliš')).toBeVisible()
  expect(screen.getByText('When on high')).toBeVisible()
  expect(screen.getByText('2 manuscripts')).toBeVisible()
  expect(screen.queryByText(/variant/)).not.toBeInTheDocument()
  expect(screen.queryByText('edited')).not.toBeInTheDocument()
})

test('shows the number of variants when there are several', () => {
  render(<LineSummaryRow line={secondLine} />)

  expect(screen.getByText('2 variants')).toBeVisible()
  expect(screen.getByText('1 manuscript')).toBeVisible()
})

test('shows an edited badge for dirty lines', () => {
  render(<LineSummaryRow line={firstLine} isDirty />)

  expect(screen.getByText('edited')).toBeVisible()
})

test('renders only inline content that fits into a button', () => {
  render(
    <button type="button">
      <LineSummaryRow line={secondLine} isDirty />
    </button>,
  )

  expect(screen.getByRole('button').innerHTML).not.toMatch(/<(?!\/?span\b)/)
  expect(screen.getByRole('button')).toHaveTextContent(
    '2%n šapliš | ammatuNor below2 variants1 manuscriptedited',
  )
})

test('re-renders only the row whose line changed', () => {
  const summarize = jest.spyOn(lineSummary, 'summarizeReconstruction')
  const renderRows = (first: LineOutline, isDirty: boolean): JSX.Element => (
    <>
      <LineSummaryRow line={first} isDirty={isDirty} />
      <LineSummaryRow line={secondLine} isDirty={false} />
    </>
  )
  const changedLine = { ...firstLine, number: '1a' }
  const { rerender } = render(renderRows(firstLine, false))

  expect(summarize.mock.calls).toEqual([[firstLine], [secondLine]])

  summarize.mockClear()
  rerender(renderRows(firstLine, false))

  expect(summarize).not.toHaveBeenCalled()

  rerender(renderRows(changedLine, false))
  rerender(renderRows(changedLine, true))

  expect(summarize.mock.calls).toEqual([[changedLine], [changedLine]])
  expect(screen.getByText('1a')).toBeVisible()
  expect(screen.getByText('edited')).toBeVisible()
})

test('marks a line that was not saved yet as new', () => {
  render(<LineSummaryRow line={firstLine} isNew />)

  expect(screen.getByText('new')).toBeVisible()
  expect(screen.queryByText('edited')).not.toBeInTheDocument()
})
