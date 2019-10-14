// @flow
import React from 'react'
import { render } from '@testing-library/react'
import LinkedImage from './LinkedImage'

describe('CDLI number provided', () => {
  const url = `https://cdli.ucla.edu/dl/photo/P000000.jpg`
  const alt = 'CDLI photo'
  let container

  beforeEach(() => {
    container = render(<LinkedImage src={url} alt={alt} />).container
  })

  it('Displays the image', async () => {
    expect(container.querySelector('img')).toHaveAttribute('src', url)
  })

  it('Has alt text', async () => {
    expect(container.querySelector('img')).toHaveAttribute('alt', alt)
  })

  it('Has a link to the image', () => {
    expect(container.querySelector('a')).toHaveAttribute('href', url)
  })
})
