import React from 'react'
import { render, screen } from '@testing-library/react'
import { Line } from 'corpus/domain/text'
import Reconstruction from './Reconstruction'

const line: Line = {
  number: "1'",
  reconstruction: 'kur ra',
  reconstructionTokens: [
    {
      value: 'kur',
      type: 'AkkadianWord',
    },
    {
      value: 'ra',
      type: 'AkkadianWord',
    },
  ],
  isBeginningOfSection: false,
  isSecondLineOfParallelism: false,
  manuscripts: [],
}

beforeEach(() => {
  render(<Reconstruction line={line} />)
})

test('line number', () => {
  expect(screen.getByText(line.number)).toBeVisible()
})

test('reconstruction', () => {
  expect(screen.getByText(line.reconstruction)).toBeVisible()
})
