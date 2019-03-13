import React from 'react'
import { render, waitForElement } from 'react-testing-library'
import Promise from 'bluebird'
import FolioImage from './FolioImage'
import { Folio } from 'fragmentarium/fragment'

const folio = new Folio({ name: 'WGL', number: '00000' })
const objectUrl = 'object URL mock'
let fragmentService
let element
let data

beforeEach(async () => {
  fragmentService = {
    findFolio: jest.fn()
  }
  URL.createObjectURL.mockReturnValueOnce(objectUrl)
  fragmentService.findFolio.mockReturnValueOnce(Promise.resolve(new Blob([''], { type: 'image/jpeg' })))
  data = new Blob(['WGL'], { type: 'image/jpeg' })
  element = render(<FolioImage fragmentService={fragmentService} folio={folio} data={data} />)
  await waitForElement(() => element.getByAltText(folio.fileName))
})

it('Creates object Url', () => {
  expect(URL.createObjectURL).toHaveBeenCalledWith(data)
})

it('Revokes objet URL on unmount', () => {
  element.unmount()
  expect(URL.revokeObjectURL).toHaveBeenCalledWith(objectUrl)
})

it('Has a link to the image', () => {
  expect(element.container.querySelector('a'))
    .toHaveAttribute('href', objectUrl)
})

it('Queries the API with given parameters', () => {
  expect(fragmentService.findFolio).toBeCalledWith(folio)
})

it('Has the filename as alt text', () => {
  expect(element.container.querySelector('img')).toHaveAttribute('alt', folio.fileName)
})
