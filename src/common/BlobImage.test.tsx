import React from 'react'
import { render, act, RenderResult } from '@testing-library/react'
import BlobImage from './BlobImage'

const objectUrl = 'object URL mock'
let data: Blob
let element: RenderResult

function configureImage(hasLink = true): void {
  beforeEach(async () => {
    ;(URL.createObjectURL as jest.Mock).mockReturnValueOnce(objectUrl)
    data = new Blob(['Babel_Project_01_cropped'], { type: 'image/jpeg' })
    act(() => {
      element = render(<BlobImage data={data} hasLink={hasLink} />)
    })
  })
}

function testImageDisplayAndUrl(): void {
  it('Displays the loaded image', () => {
    expect(element.container.querySelector('img')).toHaveAttribute(
      'src',
      objectUrl
    )
  })
  it('Creates object Url', () => {
    expect(URL.createObjectURL).toHaveBeenCalledWith(data)
  })
  it('Revokes object URL on unmount', () => {
    element.unmount()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(objectUrl)
  })
}

describe('Has a link to the image', () => {
  configureImage()
  testImageDisplayAndUrl()
  it('Has a link to the image', () => {
    expect(element.container.querySelector('a')).toHaveAttribute(
      'href',
      objectUrl
    )
  })
})

describe('Does not have a link to the image', () => {
  configureImage(false)
  testImageDisplayAndUrl()
  it('Does not have a link to the image', () => {
    expect(element.container.querySelector('a')).toBeNull()
  })
})
