import React from 'react'
import { render, waitForElement } from 'react-testing-library'
import Promise from 'bluebird'
import FolioImage from './FolioImage'
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
  element = render(<FolioImage fragmentService={fragmentService} folio={folio} />)
  await waitForElement(() => element.getByAltText(folio.fileName))
})

it('Queries the API with given parameters', () => {
  expect(fragmentService.findFolio).toBeCalledWith(folio)
})

it('Has the filename as alt text', () => {
  expect(element.container.querySelector('img')).toHaveAttribute('alt', folio.fileName)
})
