import React from 'react'
import {render, cleanup, wait} from 'react-testing-library'
import ApiClient from 'http/ApiClient'
import Auth from 'auth0/Auth'
import ApiImage from './ApiImage'
import { AbortError } from 'testHelpers'

afterEach(cleanup)

const fileName = 'WGL_00000.jpg'
const objectUrl = 'object URL mock'
let apiClient
let container

beforeEach(() => {
  apiClient = new ApiClient(new Auth())
  URL.createObjectURL.mockReturnValueOnce(objectUrl)
})

describe('When displaying image', () => {
  beforeEach(() => {
    jest.spyOn(apiClient, 'fetchBlob').mockReturnValueOnce(Promise.resolve(new Blob([''], {type: 'image/jpeg'})))
    container = render(<ApiImage apiClient={apiClient} fileName={fileName} />).container
  })

  it('Queries the API with given parameters', async () => {
    const expectedPath = `/images/${fileName}`
    expect(apiClient.fetchBlob).toBeCalledWith(expectedPath, true, AbortController.prototype.signal)
  })

  it('Displays the loaded image', async () => {
    await wait()
    expect(container.querySelector('img'))
      .toHaveAttribute('src', objectUrl)
  })

  it('Has the filename as alt text', () => {
    expect(container.querySelector('img')).toHaveAttribute('alt', fileName)
  })
})

describe('When unmounting', () => {
  const errorMessage = 'error'
  let element

  beforeEach(async () => {
    jest.spyOn(apiClient, 'fetchBlob').mockReturnValueOnce(Promise.reject(new AbortError(errorMessage)))
    element = render(<ApiImage apiClient={apiClient} fileName={fileName} />)
    container = element.container
  })

  it('Revokes objet URL', () => {
    element.unmount()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(objectUrl)
  })

  it('Aborts fetch', () => {
    element.unmount()
    expect(AbortController.prototype.abort).toHaveBeenCalled()
  })

  it('Ignores AbortError', async () => {
    expect(container).not.toHaveTextContent(errorMessage)
  })
})
