import React from 'react'
import { render } from '@testing-library/react'
import CdliImage from './CdliImage'

describe('CDLI number provided', () => {
  const url = `https://cdli.ucla.edu/dl/photo/P000000.jpg`
  let container

  beforeEach(() => {
    container = render(<CdliImage src={url} />).container
  })

  it('Displays the image from CDLI', async () => {
    expect(container.querySelector('img')).toHaveAttribute('src', url)
  })

  it('Has alt text', async () => {
    expect(container.querySelector('img')).toHaveAttribute('alt', 'CDLI photo')
  })

  it('Has a link to the image', () => {
    expect(container.querySelector('a')).toHaveAttribute('href', url)
  })
})
