import React from 'react'
import { render, screen } from '@testing-library/react'
import BlobImage from './BlobImage'

const objectUrl = 'object URL mock'
let data: Blob
let unmount: () => void

function setupImage(hasLink = true): void {
  ;(URL.createObjectURL as jest.Mock).mockReturnValueOnce(objectUrl)
  data = new Blob(['Babel_Project_01_cropped'], { type: 'image/jpeg' })
  unmount = render(<BlobImage data={data} hasLink={hasLink} />).unmount
}

function testImageDisplayAndUrl(): void {
  it('Displays the loaded image', () => {
    expect(screen.getByRole('img')).toHaveAttribute('src', objectUrl)
  })
  it('Creates object Url', () => {
    expect(URL.createObjectURL).toHaveBeenCalledWith(data)
  })
  it('Revokes object URL on unmount', () => {
    unmount()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(objectUrl)
  })
}

describe('Has a link to the image', () => {
  beforeEach(() => {
    setupImage()
  })
  testImageDisplayAndUrl()
  it('Has a link to the image', () => {
    expect(screen.getByRole('link')).toHaveAttribute('href', objectUrl)
  })
})

describe('Does not have a link to the image', () => {
  beforeEach(() => {
    setupImage(false)
  })
  testImageDisplayAndUrl()
  it('Does not have a link to the image', () => {
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})
