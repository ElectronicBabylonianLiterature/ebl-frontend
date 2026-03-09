import React from 'react'
import { render, screen } from '@testing-library/react'
import LinkedImage from './LinkedImage'

describe('CDLI number provided', () => {
  const url = `https://cdli.earth/dl/photo/P000000.jpg`
  const alt = 'CDLI photo'

  it('Displays the image', async () => {
    render(<LinkedImage src={url} alt={alt} />)
    expect(screen.getByRole('img')).toHaveAttribute('src', url)
  })

  it('Has alt text', async () => {
    render(<LinkedImage src={url} alt={alt} />)
    expect(screen.getByRole('img')).toHaveAttribute('alt', alt)
  })

  it('Has a link to the image', () => {
    render(<LinkedImage src={url} alt={alt} />)
    expect(screen.getByRole('link')).toHaveAttribute('href', url)
  })
})
