import { word } from 'corpus/application/TextService.testSupport'
import { lemmatization } from 'corpus/application/TextService.update.testSupport'
import { produce, castDraft } from 'immer'
import type { Draft } from 'immer'
import TextService from 'corpus/application/TextService'
import Reference from 'bibliography/domain/Reference'
import { BibliographyPart } from 'transliteration/domain/markup'
import {
  bibliographyEntryFactory,
  referenceFactory,
} from 'test-support/bibliography-fixtures'
import { chapter } from 'test-support/test-corpus-text'
import {
  apiClient,
  bibliographyServiceMock,
  chapterDisplay,
  chapterId,
  chapterUrl,
  fragmentServiceMock,
  setupProvenances,
  testService,
  wordServiceMock,
} from 'corpus/application/TextService.regression.testSupport'

jest.mock('bibliography/application/BibliographyService')
jest.mock('dictionary/application/WordService')
jest.mock('fragmentarium/application/FragmentService')
jest.mock('http/ApiClient')

beforeEach(() => {
  setupProvenances()
})

test('findSuggestions', async () => {
  wordServiceMock.find.mockReturnValue(Promise.resolve(word))
  fragmentServiceMock.findSuggestions.mockReturnValue(Promise.resolve([]))
  await expect(testService.findSuggestions(chapter)).resolves.toEqual(
    lemmatization,
  )
})

test('inject ChapterDisplay', async () => {
  const service = new TextService(
    apiClient,
    fragmentServiceMock,
    wordServiceMock,
    bibliographyServiceMock,
  )

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
  bibliographyServiceMock.findManyById.mockReturnValueOnce(
    Promise.resolve(
      new Map([[translationReference.id, translationReference.document]]),
    ),
  )
  bibliographyServiceMock.findManyById.mockReturnValueOnce(
    Promise.resolve(
      new Map([[intertextReference.id, intertextReference.document]]),
    ),
  )
  await expect(service.findChapterDisplay(chapterId)).resolves.toEqual(
    injectedChapter,
  )
  expect(apiClient.fetchJson).toHaveBeenCalledWith(
    `${chapterUrl}/display`,
    false,
  )
  expect(bibliographyServiceMock.findManyById).toHaveBeenCalledWith([
    translationReference.id,
  ])
  expect(bibliographyServiceMock.findManyById).toHaveBeenCalledWith([
    intertextReference.id,
  ])
})

test('listAllTexts', async () => {
  testService.listAllTexts()
  expect(apiClient.fetchJson).toHaveBeenCalledWith('/corpus/texts/all', false)
})

test('listAllChapters', async () => {
  testService.listAllChapters()
  expect(apiClient.fetchJson).toHaveBeenCalledWith(
    '/corpus/chapters/all',
    false,
  )
})
