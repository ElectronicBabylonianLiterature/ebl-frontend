import React from 'react'
import { render, screen } from '@testing-library/react'
import ApiImage from './ApiImage'

const fileName = 'Babel_Project_01_cropped.svg'

beforeEach(async () => {
  render(<ApiImage fileName={fileName} />)
  await screen.findByAltText(fileName)
})

it('Has the API URL as src', () => {
  expect(screen.getByRole('img')).toHaveAttribute(
    'src',
    `http://example.com/images/${fileName}`
  )
})

it('Has the filename as alt text', () => {
  expect(screen.getByRole('img')).toHaveAttribute('alt', fileName)
})
