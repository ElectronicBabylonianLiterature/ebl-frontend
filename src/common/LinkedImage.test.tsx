import React from 'react'
import { render, screen } from '@testing-library/react'
import LinkedImage from './LinkedImage'

describe('CDLI number provided', () => {
  const url = `https://cdli.ucla.edu/dl/photo/P000000.jpg`
  const alt = 'CDLI photo'

  beforeEach(() => {
    render(<LinkedImage src={url} alt={alt} />)
  })

  it('Displays the image', async () => {
    expect(screen.getByRole('img')).toHaveAttribute('src', url)
  })

  it('Has alt text', async () => {
    expect(screen.getByRole('img')).toHaveAttribute('alt', alt)
  })

  it('Has a link to the image', () => {
    expect(screen.getByRole('link')).toHaveAttribute('href', url)
  })
})
