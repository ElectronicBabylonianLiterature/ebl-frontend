import Promise from 'bluebird'
import ImageRepository from './ImageRepository'

const image = new Blob([''], { type: 'image/jpeg' })
const fileName = 'image.jpg'

let apiClient
let imageRepository
let promise
let authenticate = true

beforeEach(() => {
  apiClient = {
    fetchBlob: jest.fn()
  }
  imageRepository = new ImageRepository(apiClient)
})

describe('find', () => {
  beforeEach(async () => {
    jest
      .spyOn(apiClient, 'fetchBlob')
      .mockReturnValueOnce(Promise.resolve(image))
    promise = imageRepository.find(fileName, authenticate)
  })

  it('Queries the file', () => {
    expect(apiClient.fetchBlob).toBeCalledWith(
      `/images/${encodeURIComponent(fileName)}`,
      authenticate
    )
  })

  it('Resolves to blob', async () => {
    await expect(promise).resolves.toEqual(image)
  })
})
