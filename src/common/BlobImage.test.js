import React from 'react'
import { render } from 'react-testing-library'
import BlobImage from './BlobImage'

const objectUrl = 'object URL mock'
let data
let element

function testImage (hasLink) {
  beforeEach(async () => {
    URL.createObjectURL.mockReturnValueOnce(objectUrl)
    data = new Blob(['Babel_Project_01_cropped'], { type: 'image/jpeg' })
    element = render(<BlobImage data={data} hasLink={hasLink} />)
  })
  it('Displays the loaded image', () => {
    expect(element.container.querySelector('img'))
      .toHaveAttribute('src', objectUrl)
  })
  it('Creates object Url', () => {
    expect(URL.createObjectURL).toHaveBeenCalledWith(data)
  })
  it('Revokes objet URL on unmount', () => {
    element.unmount()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(objectUrl)
  })
}

describe(('Has a link to the image'), () => {
  testImage(true)
  it('Has a link to the image', () => {
    expect(element.container.querySelector('a'))
      .toHaveAttribute('href', objectUrl)
  })
})

describe(('Does not have a link to the image'), () => {
  testImage(false)
  it('Does not have a link to the image', () => {
    expect(element.container.querySelector('a'))
      .toBeNull()
  })
})
