import BibliographyService from 'bibliography/application/BibliographyService'
import TextService from 'corpus/application/TextService'
import {
  freshDisplayDto,
  staleDisplayDto,
} from 'corpus/application/TextService.cacheInvalidation.testSupport'
import { chapterId } from 'corpus/application/TextService.testSupport'
import WordService from 'dictionary/application/WordService'
import FragmentService from 'fragmentarium/application/FragmentService'
import { createApiClientTestContext } from 'http/ApiClient.testSupport'

jest.mock('bibliography/application/BibliographyService')
jest.mock('dictionary/application/WordService')
jest.mock('fragmentarium/application/FragmentService')

function createService(): TextService {
  const { apiClient } = createApiClientTestContext()
  const fragmentService = new (FragmentService as jest.Mock<
    jest.Mocked<FragmentService>
  >)()
  const wordService = new (WordService as jest.Mock<jest.Mocked<WordService>>)()
  const bibliographyService = new (BibliographyService as jest.Mock<
    jest.Mocked<BibliographyService>
  >)()
  fragmentService.fetchProvenances.mockResolvedValue([])

  return new TextService(
    apiClient,
    fragmentService,
    wordService,
    bibliographyService,
  )
}

test('HTTP-successful save with invalid JSON invalidates a warm display', async () => {
  const service = createService()
  fetchMock.mockResponseOnce(JSON.stringify(staleDisplayDto))
  await expect(service.findChapterDisplay(chapterId)).resolves.toMatchObject({
    atf: 'old display',
  })

  fetchMock.mockResponseOnce('{', { status: 200 })
  await expect(service.updateLines(chapterId, [])).rejects.toThrow()
  fetchMock.mockResponseOnce(JSON.stringify(freshDisplayDto))

  await expect(service.findChapterDisplay(chapterId)).resolves.toMatchObject({
    atf: 'saved display',
  })
  expect(fetchMock).toHaveBeenCalledTimes(3)
})

test('HTTP-rejected save retains a warm display', async () => {
  const service = createService()
  fetchMock.mockResponseOnce(JSON.stringify(staleDisplayDto))
  await service.findChapterDisplay(chapterId)

  fetchMock.mockResponseOnce(JSON.stringify({ description: 'Rejected' }), {
    status: 400,
  })
  await expect(service.updateLines(chapterId, [])).rejects.toThrow('Rejected')

  await expect(service.findChapterDisplay(chapterId)).resolves.toMatchObject({
    atf: 'old display',
  })
  expect(fetchMock).toHaveBeenCalledTimes(2)
})

test('network-failed save retains a warm display', async () => {
  const service = createService()
  fetchMock.mockResponseOnce(JSON.stringify(staleDisplayDto))
  await service.findChapterDisplay(chapterId)

  fetchMock.mockRejectOnce(new Error('offline'))
  await expect(service.updateLines(chapterId, [])).rejects.toThrow('offline')

  await expect(service.findChapterDisplay(chapterId)).resolves.toMatchObject({
    atf: 'old display',
  })
  expect(fetchMock).toHaveBeenCalledTimes(2)
})
