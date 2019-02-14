import React from 'react'
import { render } from 'react-testing-library'
import BlobImage from './BlobImage'

const objectUrl = 'object URL mock'
let data
let element

beforeEach(async () => {
  URL.createObjectURL.mockReturnValueOnce(objectUrl)
  data = new Blob(['Babel_Project_01_cropped'], { type: 'image/jpeg' })
  element = render(<BlobImage data={data} />)
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
