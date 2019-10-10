import React from 'react'
import { render, waitForElement } from '@testing-library/react'
import Promise from 'bluebird'
import { factory } from 'factory-girl'
import PhotoImage from './Photo'

const number = 'K 1'
const objectUrl = 'object URL mock'
let fragment
let fragmentService
let element
let data

beforeEach(async () => {
  fragment = await factory.build('fragment', { number })
  fragmentService = {
    findPhoto: jest.fn()
  }
  URL.createObjectURL.mockReturnValueOnce(objectUrl)
  fragmentService.findPhoto.mockReturnValueOnce(
    Promise.resolve(new Blob([''], { type: 'image/jpeg' }))
  )
  element = render(
    <PhotoImage fragmentService={fragmentService} fragment={fragment} />
  )
  await waitForElement(() => element.container.querySelector('img'))
})

it('Queries the API with given parameters', () => {
  expect(fragmentService.findPhoto).toBeCalledWith(number)
})

it('Has alt text', () => {
  expect(element.container.querySelector('img')).toHaveAttribute(
    'alt',
    `A photo of the fragment ${number}`
  )
})

it('Has a link to the image', () => {
  expect(element.container.querySelector('a')).toHaveAttribute(
    'href',
    objectUrl
  )
})

it('Has copyright', () => {
  expect(element.container).toHaveTextContent(
    'Courtesy of the Trustees of The British Museum'
  )
})
