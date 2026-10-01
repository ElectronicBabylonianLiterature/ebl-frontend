import React from 'react'
import { render, screen } from '@testing-library/react'
import ExtantLinesList from 'corpus/ui/ExtantLinesList'
import { ManuscriptExtantLines } from 'corpus/domain/extant-lines'

const boundaryCssClass = 'extant-lines__line-number--boundary'

function setup() {
  const extantLines: ManuscriptExtantLines = {
    o: [
      {
        lineNumber: {
          number: 1,
          hasPrime: false,
          prefixModifier: null,
          suffixModifier: null,
        },
        isSideBoundary: true,
      },
      {
        lineNumber: {
          number: 2,
          hasPrime: false,
          prefixModifier: null,
          suffixModifier: null,
        },
        isSideBoundary: false,
      },
    ],
  }
  render(<ExtantLinesList extantLines={extantLines} />)
}

test('Shows label.', () => {
  setup()
  expect(screen.getByText(/^o: /)).toBeVisible()
})

test('Uses long dash for ranges.', () => {
  setup()
  expect(screen.getByText(/–/)).toBeVisible()
})

test('Emphasises side boundary numbers', () => {
  setup()
  expect(screen.getByText('1')).toHaveClass(boundaryCssClass)
})

test('Does not emphasise other numbers', () => {
  setup()
  expect(screen.getByText('2')).not.toHaveClass(boundaryCssClass)
})

test('Separates ranges with commas', () => {
  const lineNumber = (number: number) => ({
    number,
    hasPrime: false,
    prefixModifier: null,
    suffixModifier: null,
  })
  render(
    <ExtantLinesList
      extantLines={{
        r: [
          { lineNumber: lineNumber(1), isSideBoundary: false },
          { lineNumber: lineNumber(5), isSideBoundary: false },
        ],
      }}
    />,
  )
  expect(screen.getByRole('listitem')).toHaveTextContent('r: 1, 5')
})
