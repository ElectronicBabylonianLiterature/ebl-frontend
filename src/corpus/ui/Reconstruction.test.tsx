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
      cleanValue: 'kur',
      enclosureType: [],
      erasure: 'NONE',
      lemmatizable: true,
      alignment: null,
      uniqueLemma: [],
      normalized: true,
      language: 'AKKADIAN',
      parts: [
        {
          value: 'kur',
          cleanValue: 'kur',
          enclosureType: [],
          erasure: 'NONE',
          type: 'ValueToken',
        },
      ],
      modifiers: [],
      type: 'AkkadianWord',
    },
    {
      value: 'ra',
      cleanValue: 'ra',
      enclosureType: [],
      erasure: 'NONE',
      lemmatizable: true,
      alignment: null,
      uniqueLemma: [],
      normalized: true,
      language: 'AKKADIAN',
      parts: [
        {
          value: 'ra',
          cleanValue: 'ra',
          enclosureType: [],
          erasure: 'NONE',
          type: 'ValueToken',
        },
      ],
      modifiers: [],
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
