import React from 'react'
import { render, screen } from '@testing-library/react'
import ExtantLinesList from './ExtantLinesList'
import { ManuscriptExtantLines } from 'corpus/domain/extant-lines'

const boundaryCssClass = 'extant-lines__line-number--boundary'

beforeEach(() => {
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
})

test('Shows label.', () => {
  expect(screen.getByText(/^o: /)).toBeVisible()
})

test('Uses long dash for ranges.', () => {
  expect(screen.getByText(/–/)).toBeVisible()
})

test('Emphasises side boundary numbers', () => {
  expect(screen.getByText('1')).toHaveClass(boundaryCssClass)
})

test('Does not emphasise other numbers', () => {
  expect(screen.getByText('2')).not.toHaveClass(boundaryCssClass)
})
