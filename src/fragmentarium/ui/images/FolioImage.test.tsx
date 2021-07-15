import React from 'react'
import { render, screen } from '@testing-library/react'
import Promise from 'bluebird'
import FolioImage from './FolioImage'
import Folio from 'fragmentarium/domain/Folio'

const folio = new Folio({ name: 'WGL', number: '00000' })
const objectUrl = 'object URL mock'
let fragmentService

beforeEach(async () => {
  fragmentService = {
    findFolio: jest.fn(),
  }
  ;(URL.createObjectURL as jest.Mock).mockReturnValueOnce(objectUrl)
  fragmentService.findFolio.mockReturnValueOnce(
    Promise.resolve(new Blob([''], { type: 'image/jpeg' }))
  )
  render(<FolioImage fragmentService={fragmentService} folio={folio} />)
  await screen.findByAltText(folio.fileName)
})

it('Queries the API with given parameters', () => {
  expect(fragmentService.findFolio).toBeCalledWith(folio)
})

it('Has the filename as alt text', () => {
  expect(screen.getByRole('img')).toHaveAttribute('alt', folio.fileName)
})

it('Has a link to the image', () => {
  expect(screen.getByRole('link')).toHaveAttribute('href', objectUrl)
})
