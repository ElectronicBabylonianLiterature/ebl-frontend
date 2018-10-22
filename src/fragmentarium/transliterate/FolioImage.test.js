import React from 'react'
import { render, wait } from 'react-testing-library'
import Promise from 'bluebird'
import BlobImage from './FolioImage'
import createFolio from 'fragmentarium/createFolio'

const folio = createFolio('WGL', '00000')
const objectUrl = 'object URL mock'
let fragmentService
let element

beforeEach(async () => {
  fragmentService = {
    findFolio: jest.fn()
  }
  URL.createObjectURL.mockReturnValueOnce(objectUrl)
  fragmentService.findFolio.mockReturnValueOnce(Promise.resolve(new Blob([''], { type: 'image/jpeg' })))
  element = render(<BlobImage fragmentService={fragmentService} folio={folio} />)
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
  expect(element.container.querySelector('img')).toHaveAttribute('alt', folio.fileName)
})

it('Revokes objet URL on unmount', () => {
  element.unmount()
  expect(URL.revokeObjectURL).toHaveBeenCalledWith(objectUrl)
})
