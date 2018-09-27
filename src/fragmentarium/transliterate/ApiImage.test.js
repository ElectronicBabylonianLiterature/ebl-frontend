import React from 'react'
import { render, wait } from 'react-testing-library'
import Promise from 'bluebird'
import ApiImage from './ApiImage'

const fileName = 'WGL_00000.jpg'
const objectUrl = 'object URL mock'
let imageRepository
let element

beforeEach(async () => {
  imageRepository = {
    find: jest.fn()
  }
  URL.createObjectURL.mockReturnValueOnce(objectUrl)
  imageRepository.find.mockReturnValueOnce(Promise.resolve(new Blob([''], { type: 'image/jpeg' })))
  element = render(<ApiImage imageRepository={imageRepository} fileName={fileName} />)
  await wait()
})

it('Queries the API with given parameters', () => {
  expect(imageRepository.find).toBeCalledWith(fileName)
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
  expect(element.container.querySelector('img')).toHaveAttribute('alt', fileName)
})

it('Revokes objet URL on unmount', () => {
  element.unmount()
  expect(URL.revokeObjectURL).toHaveBeenCalledWith(objectUrl)
})
