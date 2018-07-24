import React from 'react'
import {render, cleanup, wait} from 'react-testing-library'
import ApiClient from 'http/ApiClient'
import Auth from 'auth0/Auth'
import ApiImage from './ApiImage'

afterEach(cleanup)

const fileName = 'WGL_00000.jpg'
let container

beforeEach(() => {
  const apiClient = new ApiClient(new Auth())
  URL.createObjectURL.mockReturnValueOnce('expectedUrl')
  jest.spyOn(apiClient, 'fetchBlob').mockReturnValueOnce(Promise.resolve(new Blob([''], {type: 'image/jpeg'})))
  container = render(<ApiImage apiClient={apiClient} fileName={fileName} />).container
})

it('Displays the loaded image', async () => {
  await wait()
  expect(container.querySelector('img'))
    .toHaveAttribute('src', 'expectedUrl')
})

it('Has the filename as alt text', () => {
  expect(container.querySelector('img')).toHaveAttribute('alt', fileName)
})
