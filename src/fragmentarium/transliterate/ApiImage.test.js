import React from 'react'
import { render, wait } from 'react-testing-library'
import Promise from 'bluebird'
import ApiClient from 'http/ApiClient'
import Auth from 'auth0/Auth'
import ApiImage from './ApiImage'

const fileName = 'WGL_00000.jpg'
const objectUrl = 'object URL mock'
let apiClient
let element

beforeEach(async () => {
  apiClient = new ApiClient(new Auth())
  URL.createObjectURL.mockReturnValueOnce(objectUrl)
  jest.spyOn(apiClient, 'fetchBlob').mockReturnValueOnce(Promise.resolve(new Blob([''], { type: 'image/jpeg' })))
  element = render(<ApiImage apiClient={apiClient} fileName={fileName} />)
  await wait()
})

it('Queries the API with given parameters', () => {
  const expectedPath = `/images/${fileName}`
  expect(apiClient.fetchBlob).toBeCalledWith(expectedPath, true)
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
