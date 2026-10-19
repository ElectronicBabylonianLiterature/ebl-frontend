import React from 'react'
import { render, screen } from '@testing-library/react'
import AboutFigure from 'about/ui/AboutFigure'

it('renders the image with its caption', () => {
  render(
    <AboutFigure side="Left" width="300px" src="image.jpg" alt="An image">
      A caption
    </AboutFigure>,
  )
  expect(screen.getByRole('img', { name: 'An image' })).toHaveClass(
    'Introduction__300px',
  )
  expect(screen.getByRole('figure')).toHaveClass('Introduction__photoLeft')
  expect(screen.getByText('A caption')).toHaveClass('Introduction__caption')
  expect(screen.queryByRole('link')).not.toBeInTheDocument()
})

it('links the image when given a link', () => {
  render(
    <AboutFigure
      side="Right"
      width="250px"
      src="image.jpg"
      alt="An image"
      href="https://example.com/book"
    >
      A caption
    </AboutFigure>,
  )
  const link = screen.getByRole('link', { name: 'An image' })
  expect(link).toHaveAttribute('href', 'https://example.com/book')
  expect(screen.getByRole('figure')).toHaveClass('Introduction__photoRight')
})
