import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PerformanceReadout, {
  formatSeconds,
} from 'corpus/ui/edit-lite/PerformanceReadout'

const diagnostics = ['Unknown siglum "X"', 'Row without a line']

function createReadout(
  readoutDiagnostics: readonly string[],
  recountKey?: string,
): JSX.Element {
  return (
    <PerformanceReadout
      loadMilliseconds={3249.6}
      kind="legacy"
      lineCount={162}
      manuscriptCount={75}
      diagnostics={readoutDiagnostics}
      recountKey={recountKey}
    />
  )
}

function renderReadout(readoutDiagnostics: readonly string[] = []): void {
  render(createReadout(readoutDiagnostics))
}

function numberOf(testId: string): number {
  return Number(screen.getByTestId(testId).textContent)
}

function countElementTags(): number {
  return (document.documentElement.outerHTML.match(/<[a-z]/gi) ?? []).length
}

function renderMoreContent(): void {
  render(
    <>
      <div className="ace_editor" />
      <select aria-label="Options">
        <option>a</option>
        <option>b</option>
      </select>
    </>,
  )
}

test.each([
  [0, '0.0 s'],
  [149, '0.1 s'],
  [3249.6, '3.2 s'],
  [31000, '31.0 s'],
])('formatSeconds(%d)', (milliseconds, expected) => {
  expect(formatSeconds(milliseconds)).toBe(expected)
})

test('shows the load time, the source and the chapter size', () => {
  renderReadout()

  expect(screen.getByTestId('edit-lite-performance')).toHaveAccessibleName(
    'Performance',
  )
  expect(screen.getByTestId('edit-lite-load-ms')).toHaveTextContent('3.2 s')
  expect(screen.getByTestId('edit-lite-load-ms')).toHaveAttribute(
    'data-milliseconds',
    '3250',
  )
  expect(screen.getByTestId('edit-lite-source-kind')).toHaveTextContent(
    'legacy',
  )
  expect(numberOf('edit-lite-line-count')).toBe(162)
  expect(numberOf('edit-lite-manuscript-count')).toBe(75)
  expect(numberOf('edit-lite-diagnostics')).toBe(0)
  expect(screen.getByTestId('edit-lite-dom-nodes')).not.toHaveAttribute(
    'data-milliseconds',
  )
})

test('counts the document on mount and on refresh', async () => {
  renderReadout()
  const elementCount = countElementTags()

  expect(numberOf('edit-lite-dom-nodes')).toBe(elementCount)
  expect(numberOf('edit-lite-ace-editors')).toBe(0)
  expect(numberOf('edit-lite-options')).toBe(0)

  renderMoreContent()

  expect(numberOf('edit-lite-dom-nodes')).toBe(elementCount)
  expect(numberOf('edit-lite-ace-editors')).toBe(0)

  await userEvent.click(screen.getByRole('button', { name: 'Refresh' }))

  expect(numberOf('edit-lite-dom-nodes')).toBe(elementCount + 5)
  expect(numberOf('edit-lite-ace-editors')).toBe(1)
  expect(numberOf('edit-lite-options')).toBe(2)
})

test('counts the document again when the recount key changes', async () => {
  const { rerender } = render(createReadout(diagnostics, 'accordion:0'))
  const elementCount = countElementTags()
  await userEvent.click(
    screen.getByRole('button', { name: 'Show 2 diagnostics' }),
  )
  renderMoreContent()

  rerender(createReadout(diagnostics, 'accordion:0'))

  expect(numberOf('edit-lite-dom-nodes')).toBe(elementCount)

  rerender(createReadout(diagnostics, 'accordion:10'))

  expect(numberOf('edit-lite-dom-nodes')).toBe(elementCount + 7)
  expect(numberOf('edit-lite-ace-editors')).toBe(1)
  expect(numberOf('edit-lite-options')).toBe(2)
  expect(screen.getAllByRole('listitem')).toHaveLength(2)
})

test('has no diagnostics list without diagnostics', () => {
  renderReadout()

  expect(
    screen.queryByRole('button', { name: /diagnostic/ }),
  ).not.toBeInTheDocument()
  expect(screen.queryByRole('list')).not.toBeInTheDocument()
})

test('the diagnostics can be expanded and collapsed', async () => {
  renderReadout(diagnostics)

  expect(numberOf('edit-lite-diagnostics')).toBe(2)
  expect(screen.queryByRole('listitem')).not.toBeInTheDocument()

  await userEvent.click(
    screen.getByRole('button', { name: 'Show 2 diagnostics', expanded: false }),
  )

  expect(
    screen.getAllByRole('listitem').map((item) => item.textContent),
  ).toEqual(diagnostics)
  expect(screen.getByRole('list')).toBeVisible()

  await userEvent.click(
    screen.getByRole('button', { name: 'Hide 2 diagnostics', expanded: true }),
  )

  expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
})

test('a single diagnostic is counted in the singular', () => {
  renderReadout(diagnostics.slice(0, 1))

  expect(
    screen.getByRole('button', { name: 'Show 1 diagnostic' }),
  ).toBeVisible()
})
