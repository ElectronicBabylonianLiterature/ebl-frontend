import React from 'react'
import { render } from 'react-testing-library'
import Promise from 'bluebird'
import BlobImage from './BlobImage'

const objectUrl = 'object URL mock'
let fragmentService
let data
let element

beforeEach(async () => {
  fragmentService = {
    findFolio: jest.fn()
  }
  URL.createObjectURL.mockReturnValueOnce(objectUrl)
  fragmentService.findFolio.mockReturnValueOnce(Promise.resolve(new Blob([''], { type: 'image/jpeg' })))
  element = render(<BlobImage fragmentService={data} />)
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
