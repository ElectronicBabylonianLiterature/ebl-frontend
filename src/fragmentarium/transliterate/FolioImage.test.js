import React from 'react'
import { render, wait } from 'react-testing-library'
import Promise from 'bluebird'
import BlobImage from './FolioImage'

const folio = { name: 'WGL', number: '00000' }
const alt = 'WGL_00000.jpg'
const objectUrl = 'object URL mock'
let fragmentService
let element

beforeEach(async () => {
  fragmentService = {
    findFolio: jest.fn()
  }
  URL.createObjectURL.mockReturnValueOnce(objectUrl)
  fragmentService.findFolio.mockReturnValueOnce(Promise.resolve(new Blob([''], { type: 'image/jpeg' })))
  element = render(<BlobImage fragmentService={fragmentService} folio={folio} alt={alt} />)
  await wait()
})

it('Queries the API with given parameters', () => {
  expect(fragmentService.findFolio).toBeCalledWith(folio)
})

it('Displays the loaded image', () => {
  expect(element.container.querySelector('img'))
    .toHaveAttribute('src', objectUrl)
})

it('Has a link to the image', () => {
  expect(element.container.querySelector('a'))
    .toHaveAttribute('href', objectUrl)
})

it('Has the filename as alt text', () => {
  expect(element.container.querySelector('img')).toHaveAttribute('alt', alt)
})

it('Revokes objet URL on unmount', () => {
  element.unmount()
  expect(URL.revokeObjectURL).toHaveBeenCalledWith(objectUrl)
})
