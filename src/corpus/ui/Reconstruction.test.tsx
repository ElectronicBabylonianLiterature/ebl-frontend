import React from 'react'
import { render, screen } from '@testing-library/react'
import Reconstruction from './Reconstruction'
import { text } from 'test-support/test-corpus-text'

const line = text.chapters[0].lines[0].variants[0]

beforeEach(() => {
  render(<Reconstruction line={line} />)
})

test('reconstruction', () => {
  expect(screen.getByText(line.reconstruction)).toBeVisible()
})
