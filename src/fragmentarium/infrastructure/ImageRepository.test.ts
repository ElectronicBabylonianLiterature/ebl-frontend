import Promise from 'bluebird'
import ApiImageRepository from './ImageRepository'
import Folio from 'fragmentarium/domain/Folio'
import { folioFactory } from 'test-support/fragment-data-fixtures'

const image = new Blob([''], { type: 'image/jpeg' })

let apiClient
let imageRepository
let promise

beforeEach(() => {
  apiClient = {
    fetchBlob: jest.fn(),
  }
  imageRepository = new ApiImageRepository(apiClient)
})

describe('find', () => {
  const fileName = 'image of tower of babel.jpg'

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

  beforeEach(() => {
    folio = folioFactory.build()
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
      false
    )
  })

  it('Resolves to blob', async () => {
    await expect(promise).resolves.toEqual(image)
  })
})

describe('findPhoto', () => {
  const number = 'ABC 123+456'

  beforeEach(async () => {
    jest
      .spyOn(apiClient, 'fetchBlob')
      .mockReturnValueOnce(Promise.resolve(image))
    promise = imageRepository.findPhoto(number)
  })

  it('Queries the photo', () => {
    expect(apiClient.fetchBlob).toBeCalledWith(
      `/fragments/${encodeURIComponent(number)}/photo`,
      false
    )
  })

  it('Resolves to blob', async () => {
    await expect(promise).resolves.toEqual(image)
  })
})
