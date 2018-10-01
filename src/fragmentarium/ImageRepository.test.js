import Promise from 'bluebird'
import ApiClient from 'http/ApiClient'
import Auth from 'auth/Auth'
import ImageRepository from './ImageRepository'

const image = new Blob([''], { type: 'image/jpeg' })
const fileName = 'image.jpg'

let apiClient
let imageRepository
let promise

beforeEach(() => {
  apiClient = new ApiClient(new Auth())
  imageRepository = new ImageRepository(apiClient)
})

describe('find', () => {
  beforeEach(async () => {
    jest.spyOn(apiClient, 'fetchBlob').mockReturnValueOnce(Promise.resolve(image))
    promise = imageRepository.find(fileName)
  })

  it('Queries the file', () => {
    expect(apiClient.fetchBlob).toBeCalledWith(`/images/${encodeURIComponent(fileName)}`, true)
  })

  it('Resolves to blob', async () => {
    await expect(promise).resolves.toEqual(image)
  })
})
