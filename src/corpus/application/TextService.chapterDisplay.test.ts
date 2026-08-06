import { produce, castDraft } from 'immer'
import type { Draft } from 'immer'
import Reference from 'bibliography/domain/Reference'
import { BibliographyPart } from 'transliteration/domain/markup'
import {
  bibliographyEntryFactory,
  referenceFactory,
} from 'test-support/bibliography-fixtures'
import {
  chapterDisplay,
  chapterDisplayDto,
  chapterId,
  chapterUrl,
  createTextServiceTestContext,
} from 'corpus/application/TextService.testSupport'

jest.mock('bibliography/application/BibliographyService')
jest.mock('dictionary/application/WordService')
jest.mock('fragmentarium/application/FragmentService')
jest.mock('http/ApiClient')

const {
  apiClient,
  fragmentServiceMock,
  bibliographyServiceMock,
  createService,
} = createTextServiceTestContext()

beforeEach(() => {
  fragmentServiceMock.fetchProvenances.mockReturnValue(Promise.resolve([]))
})

function createInjectedPart(reference: Reference): Draft<BibliographyPart> {
  return {
    reference: {
      id: reference.id,
      type: reference.type,
      pages: reference.pages,
      notes: reference.notes,
      linesCited: castDraft(reference.linesCited),
    },
    type: 'BibliographyPart',
  }
}

test('inject ChapterDisplay', async () => {
  const service = createService()

  const translationReference = referenceFactory.build(
    {},
    {
      associations: {
        document: bibliographyEntryFactory.build(
          {},
          { associations: { id: 'XY1' } },
        ),
      },
    },
  )
  const intertextReference = referenceFactory.build(
    {},
    {
      associations: {
        document: bibliographyEntryFactory.build(
          {},
          { associations: { id: 'XY2' } },
        ),
      },
    },
  )
  const chapterWithReferences = produce(chapterDisplay, (draft) => {
    draft.lines[0].translation[0].parts = [
      createInjectedPart(translationReference),
    ]
    draft.lines[0].variants[0].intertext = [
      createInjectedPart(intertextReference),
    ]
  })
  const injectedChapter = produce(chapterDisplay, (draft) => {
    draft.lines[0].translation[0].parts = [
      {
        reference: castDraft(translationReference),
        type: 'BibliographyPart',
      },
    ]
    draft.lines[0].variants[0].intertext = [
      {
        reference: castDraft(intertextReference),
        type: 'BibliographyPart',
      },
    ]
  })
  apiClient.fetchJson.mockReturnValue(Promise.resolve(chapterWithReferences))
  bibliographyServiceMock.findMany.mockReturnValueOnce(
    Promise.resolve([translationReference.document]),
  )
  bibliographyServiceMock.findMany.mockReturnValueOnce(
    Promise.resolve([intertextReference.document]),
  )
  await expect(service.findChapterDisplay(chapterId)).resolves.toEqual(
    injectedChapter,
  )
  expect(apiClient.fetchJson).toHaveBeenCalledWith(
    `${chapterUrl}/display`,
    false,
  )
  expect(bibliographyServiceMock.findMany).toHaveBeenCalledWith([
    translationReference.id,
  ])
  expect(bibliographyServiceMock.findMany).toHaveBeenCalledWith([
    intertextReference.id,
  ])
})

describe('findChapterDisplay caching', () => {
  test('deduplicates in-flight chapter display requests', async () => {
    const service = createService()
    fragmentServiceMock.fetchProvenances.mockReturnValue(Promise.resolve([]))

    apiClient.fetchJson.mockResolvedValue(chapterDisplayDto)

    const [firstRequest, secondRequest] = await Promise.all([
      service.findChapterDisplay(chapterId),
      service.findChapterDisplay(chapterId),
    ])

    expect(firstRequest).toMatchObject({
      id: chapterDisplay.id,
    })
    expect(secondRequest).toMatchObject({
      id: chapterDisplay.id,
    })
    expect(apiClient.fetchJson).toHaveBeenCalledTimes(1)
  })

  test('clears chapter display cache when scope changes', async () => {
    const scope = { current: 'guest' }
    const service = createService(() => scope.current)

    fragmentServiceMock.fetchProvenances.mockReturnValue(Promise.resolve([]))
    apiClient.fetchJson.mockResolvedValue(chapterDisplayDto)

    await expect(service.findChapterDisplay(chapterId)).resolves.toMatchObject({
      id: chapterDisplay.id,
    })
    await expect(service.findChapterDisplay(chapterId)).resolves.toMatchObject({
      id: chapterDisplay.id,
    })

    scope.current = 'authenticated:user-a'

    await expect(service.findChapterDisplay(chapterId)).resolves.toMatchObject({
      id: chapterDisplay.id,
    })

    expect(apiClient.fetchJson).toHaveBeenCalledTimes(2)
  })
})
