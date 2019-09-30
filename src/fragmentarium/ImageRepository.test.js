// @flow
import Promise from 'bluebird'
import ApiImageRepository from './ImageRepository'
import { Folio } from './fragment'
import { factory } from 'factory-girl'

const image = new Blob([''], { type: 'image/jpeg' })
const fileName = 'image.jpg'

let apiClient
let imageRepository
let promise

beforeEach(() => {
  apiClient = {
    fetchBlob: jest.fn()
  }
  imageRepository = new ApiImageRepository(apiClient)
})

describe('find', () => {
  beforeEach(async () => {
    jest
      .spyOn(apiClient, 'fetchBlob')
      .mockReturnValueOnce(Promise.resolve(image))
    promise = imageRepository.find(fileName)
  })

  it('Queries the file', () => {
    expect(apiClient.fetchBlob).toBeCalledWith(
      `/images/${encodeURIComponent(fileName)}`,
      false
    )
  })

  it('Resolves to blob', async () => {
    await expect(promise).resolves.toEqual(image)
  })
})

describe('findFolio', () => {
  let folio: Folio

  beforeEach(async () => {
    folio = await factory.build('folio')
    jest
      .spyOn(apiClient, 'fetchBlob')
      .mockReturnValueOnce(Promise.resolve(image))
    promise = imageRepository.findFolio(folio)
  })

  it('Queries the folio', () => {
    expect(apiClient.fetchBlob).toBeCalledWith(
      `/folios/${encodeURIComponent(folio.name)}/${encodeURIComponent(
        folio.number
      )}`,
      true
    )
  })

  it('Resolves to blob', async () => {
    await expect(promise).resolves.toEqual(image)
  })
})
