import React from 'react'
import { render, waitForElement } from '@testing-library/react'
import Promise from 'bluebird'
import FolioImage from './FolioImage'
import { Folio } from 'fragmentarium/domain/fragment'

const folio = new Folio({ name: 'WGL', number: '00000' })
const objectUrl = 'object URL mock'
let fragmentService
let element

beforeEach(async () => {
  fragmentService = {
    findFolio: jest.fn()
  }
  ;(URL.createObjectURL as jest.Mock).mockReturnValueOnce(objectUrl)
  fragmentService.findFolio.mockReturnValueOnce(
    Promise.resolve(new Blob([''], { type: 'image/jpeg' }))
  )
  element = render(
    <FolioImage fragmentService={fragmentService} folio={folio} />
  )
  await waitForElement(() => element.getByAltText(folio.fileName))
})

it('Queries the API with given parameters', () => {
  expect(fragmentService.findFolio).toBeCalledWith(folio)
})

it('Has the filename as alt text', () => {
  expect(element.container.querySelector('img')).toHaveAttribute(
    'alt',
    folio.fileName
  )
})

it('Has a link to the image', () => {
  expect(element.container.querySelector('a')).toHaveAttribute(
    'href',
    objectUrl
  )
})
