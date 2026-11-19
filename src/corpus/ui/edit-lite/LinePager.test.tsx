import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LinePager, {
  defaultPageSize,
  formatLineRange,
  normalizePageSize,
  pageSizes,
} from 'corpus/ui/edit-lite/LinePager'

interface PagerOptions {
  readonly pageStart?: number
  readonly pageSize?: number
  readonly lineCount?: number
  readonly isLineFound?: boolean
}

interface PagerCallbacks {
  readonly onPageStartChange: jest.Mock<void, [number]>
  readonly onPageSizeChange: jest.Mock<void, [number]>
  readonly onGoToLine: jest.Mock<boolean, [string]>
}

function renderPager({
  pageStart = 10,
  pageSize = 10,
  lineCount = 162,
  isLineFound = true,
}: PagerOptions = {}): PagerCallbacks {
  const callbacks: PagerCallbacks = {
    onPageStartChange: jest.fn<void, [number]>(),
    onPageSizeChange: jest.fn<void, [number]>(),
    onGoToLine: jest.fn<boolean, [string]>(() => isLineFound),
  }
  render(
    <LinePager
      pageStart={pageStart}
      pageSize={pageSize}
      lineCount={lineCount}
      {...callbacks}
    />,
  )
  return callbacks
}

function button(name: string): HTMLElement {
  return screen.getByRole('button', { name })
}

function goToLineInput(): HTMLElement {
  return screen.getByRole('textbox', { name: 'Go to line' })
}

test.each([
  [10, 10, 162, 'Lines 11–20 of 162'],
  [160, 10, 162, 'Lines 161–162 of 162'],
  [0, 50, 12, 'Lines 1–12 of 12'],
  [20, 10, 21, 'Line 21 of 21'],
  [0, 10, 0, 'No lines'],
])(
  'the range from position %s with %s per page of %s lines is "%s"',
  (pageStart: number, pageSize: number, lineCount: number, range: string) => {
    expect(formatLineRange(pageStart, pageSize, lineCount)).toBe(range)
  },
)

test.each([
  [10, 10],
  [25, 25],
  [50, 50],
  [undefined, defaultPageSize],
  [7, defaultPageSize],
  [100, defaultPageSize],
  [Number.NaN, defaultPageSize],
])(
  'a requested page size of %s becomes %s',
  (requestedPageSize: number | undefined, pageSize: number) => {
    expect(normalizePageSize(requestedPageSize)).toBe(pageSize)
  },
)

test('shows the lines of the page and where it is in the chapter', () => {
  renderPager()

  expect(screen.getByRole('navigation', { name: 'Line pages' })).toBeVisible()
  expect(screen.getByText('Lines 11–20 of 162')).toBeVisible()
  expect(button('Previous')).toBeEnabled()
  expect(button('Next')).toBeEnabled()
})

test('previous and next move by one page', async () => {
  const { onPageStartChange } = renderPager({ pageStart: 20, pageSize: 10 })
  await userEvent.click(button('Previous'))
  await userEvent.click(button('Next'))

  expect(onPageStartChange.mock.calls).toEqual([[10], [30]])
})

test('previous is disabled on the first page', () => {
  renderPager({ pageStart: 0 })

  expect(button('Previous')).toBeDisabled()
  expect(button('Next')).toBeEnabled()
})

test.each([
  [160, 162],
  [150, 160],
])(
  'next is disabled on the last page from position %s of %s lines',
  (pageStart: number, lineCount: number) => {
    renderPager({ pageStart, lineCount })

    expect(button('Previous')).toBeEnabled()
    expect(button('Next')).toBeDisabled()
  },
)

test('there is nowhere to go in a chapter without lines', () => {
  renderPager({ pageStart: 0, lineCount: 0 })

  expect(screen.getByText('No lines')).toBeVisible()
  expect(button('Previous')).toBeDisabled()
  expect(button('Next')).toBeDisabled()
})

test('offers the page sizes and reports the selected one', async () => {
  const { onPageSizeChange } = renderPager({ pageSize: 25 })
  const select = screen.getByRole('combobox', { name: 'Lines per page' })

  expect(select).toHaveValue('25')
  expect(
    screen.getAllByRole('option').map((option) => Number(option.textContent)),
  ).toEqual(pageSizes)

  await userEvent.selectOptions(select, '50')

  expect(onPageSizeChange.mock.calls).toEqual([[50]])
})

test('go to line submits the trimmed line number', async () => {
  const { onGoToLine } = renderPager()
  await userEvent.type(goToLineInput(), '  12a ')
  await userEvent.click(button('Go'))

  expect(onGoToLine.mock.calls).toEqual([['12a']])
  expect(goToLineInput()).toHaveAttribute('aria-invalid', 'false')
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})

test('go to line can be submitted with the enter key', async () => {
  const { onGoToLine } = renderPager()
  await userEvent.type(goToLineInput(), '37{Enter}')

  expect(onGoToLine.mock.calls).toEqual([['37']])
})

test('go to line ignores an empty line number', async () => {
  const { onGoToLine } = renderPager({ isLineFound: false })
  await userEvent.type(goToLineInput(), '   ')
  await userEvent.click(button('Go'))

  expect(onGoToLine).not.toHaveBeenCalled()
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})

test('go to line says so when the line does not exist', async () => {
  renderPager({ isLineFound: false })
  await userEvent.type(goToLineInput(), '999')
  await userEvent.click(button('Go'))

  expect(screen.getByRole('alert')).toHaveTextContent('Line 999 was not found.')
  expect(goToLineInput()).toHaveAttribute('aria-invalid', 'true')
  expect(goToLineInput()).toHaveAccessibleDescription('Line 999 was not found.')
})

test('typing a new line number removes the not found message', async () => {
  renderPager({ isLineFound: false })
  await userEvent.type(goToLineInput(), '999{Enter}')
  await userEvent.type(goToLineInput(), '{Backspace}')

  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  expect(goToLineInput()).toHaveAttribute('aria-invalid', 'false')
  expect(goToLineInput()).toHaveValue('99')
})
