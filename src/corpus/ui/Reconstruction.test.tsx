import React from 'react'
import { render, screen } from '@testing-library/react'
import Reconstruction from './Reconstruction'
import { chapter } from 'test-support/test-corpus-text'

const line = chapter.lines[0].variants[0]

test('reconstruction', () => {
  render(<Reconstruction line={line} />)
  expect(screen.getByText(line.reconstruction)).toBeVisible()
})
