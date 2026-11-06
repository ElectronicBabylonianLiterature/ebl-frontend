import React from 'react'
import { render, screen } from '@testing-library/react'
import Reference from 'bibliography/domain/Reference'
import LineNumber from 'corpus/ui/LineNumber'
import { lineDisplayFactory } from 'test-support/chapter-fixtures'
import { OldLineNumber } from 'transliteration/domain/line-number'

const reference = new Reference('COPY', '12–14', 'Old edition', [
  'o 1',
]).withIdentity('missing-reference', true)

function renderLineNumbers(
  oldLineNumbers: readonly OldLineNumber[],
  showOldLineNumbers = true,
): void {
  const line = lineDisplayFactory.build({ oldLineNumbers })

  render(
    <table>
      <tbody>
        <tr>
          <LineNumber
            line={line}
            activeLine=""
            showOldLineNumbers={showOldLineNumbers}
          />
        </tr>
      </tbody>
    </table>,
  )
}

test('shows an unavailable old line citation with its identity and details', () => {
  renderLineNumbers([{ number: 'A38', reference }])

  expect(screen.getByText('A38')).toBeVisible()
  expect(screen.getByText(/missing-reference/)).toBeVisible()
  expect(screen.getByText(/missing-reference/)).toHaveTextContent(
    'missing-reference: 12–14 [l. o 1] [Old edition] (C)',
  )
})

test('separates multiple old line citations and preserves each identity', () => {
  renderLineNumbers([
    { number: 'A38', reference },
    {
      number: 'B10',
      reference: new Reference('EDITION').withIdentity('other-reference', true),
    },
  ])

  expect(screen.getByText('A38')).toBeVisible()
  expect(screen.getByText('B10')).toBeVisible()
  expect(screen.getByText(/other-reference/)).toBeVisible()
  expect(screen.getByRole('cell')).toHaveTextContent('(C); B10')
})

test('does not render an old line section when the chapter has none', () => {
  renderLineNumbers([])

  expect(screen.getByRole('cell')).not.toHaveTextContent('(')
  expect(screen.queryByText(/missing-reference/)).not.toBeInTheDocument()
})

test('hides unavailable old line citations when the setting is disabled', () => {
  renderLineNumbers([{ number: 'A38', reference }], false)

  expect(
    screen.getByText(/\(/, {
      selector: '.chapter-display__old-line-numbers',
    }),
  ).toHaveClass('hidden')
})
