import TextService from 'corpus/application/TextService'
import {
  apiClient,
  bibliographyServiceMock,
  chapterDisplayDto,
  chapterId,
  chapterUrl,
  fragmentServiceMock,
  setupProvenances,
  wordServiceMock,
} from 'corpus/application/TextService.regression.testSupport'
import {
  bibliographyEntryFactory,
  referenceDtoFactory,
} from 'test-support/bibliography-fixtures'

function createService(getCacheScope?: () => string): TextService {
  return new TextService(
    apiClient,
    fragmentServiceMock,
    wordServiceMock,
    bibliographyServiceMock,
    getCacheScope,
  )
}

beforeEach(() => {
  jest.clearAllMocks()
  setupProvenances()
})

test('queries after a throwing cache-scope resolver', async () => {
  const result = { items: [], matchCountTotal: 0 }
  const service = createService(() => {
    throw new Error('scope unavailable')
  })
  apiClient.fetchJson.mockReturnValue(Promise.resolve(result))

  await expect(service.query({ lemmas: 'ina I' })).resolves.toBe(result)

  expect(apiClient.fetchJson).toHaveBeenCalledWith(
    '/corpus/query?lemmas=ina%20I',
    false,
    undefined,
  )
})

test('searches without a genre', async () => {
  const service = createService()
  apiClient.fetchJson.mockReturnValue(Promise.resolve([]))

  await expect(service.searchLemma('ina I')).resolves.toEqual([])

  expect(apiClient.fetchJson).toHaveBeenCalledWith(
    '/lemmasearch?genre&lemma=ina%20I',
    false,
    undefined,
  )
})

test('maps a secondary variant without a note', async () => {
  const service = createService()
  const variant = {
    ...chapterDisplayDto.lines[0].variants[0],
    note: null,
  }

  await expect(service.findLineVariant(variant, false)).resolves.toMatchObject({
    note: null,
    isPrimaryVariant: false,
  })
})

test('loads selected display lines and injects old-line references', async () => {
  const service = createService()
  const entry = bibliographyEntryFactory.build()
  const reference = referenceDtoFactory.build()
  const displayDto = {
    ...chapterDisplayDto,
    lines: [
      {
        ...chapterDisplayDto.lines[0],
        oldLineNumbers: [{ number: '1', reference }],
      },
    ],
  }
  bibliographyServiceMock.find.mockReturnValue(Promise.resolve(entry))
  apiClient.fetchJson.mockReturnValue(Promise.resolve(displayDto))

  const display = await service.findChapterDisplay(chapterId, [2], [1])

  expect(apiClient.fetchJson).toHaveBeenCalledWith(
    `${chapterUrl}/display?lines=2&variants=1`,
    false,
  )
  expect(bibliographyServiceMock.find).toHaveBeenCalledWith(reference.id)
  expect(display.lines[0].oldLineNumbers[0].reference.document).toBe(entry)
})
