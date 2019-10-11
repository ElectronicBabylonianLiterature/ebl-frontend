import React from 'react'
import { render, waitForElement } from '@testing-library/react'
import Promise from 'bluebird'
import Image from './Image'

const objectUrl = 'object URL mock'
let fragmentService
let element
let fileName = 'Babel_Project_01_cropped.svg'

beforeEach(async () => {
  fragmentService = {
    findImage: jest.fn()
  }
  URL.createObjectURL.mockReturnValueOnce(objectUrl)
  fragmentService.findImage.mockReturnValueOnce(
    Promise.resolve(new Blob([''], { type: 'image/svg+xml' }))
  )
  element = render(
    <Image fragmentService={fragmentService} fileName={fileName} />
  )
  await waitForElement(() => element.getByAltText(fileName))
})

it('Queries the API with given parameters', () => {
  expect(fragmentService.findImage).toBeCalledWith(fileName)
})

it('Has the filename as alt text', () => {
  expect(element.container.querySelector('img')).toHaveAttribute(
    'alt',
    fileName
  )
})
