import Bluebird from 'bluebird'
import { produce, castDraft } from 'immer'
import type { Draft } from 'immer'
import TextService from 'corpus/application/TextService'
import Word from 'dictionary/domain/Word'
import Lemma from 'transliteration/domain/Lemma'
import { LemmatizationToken } from 'transliteration/domain/Lemmatization'
import Reference from 'bibliography/domain/Reference'
import { BibliographyPart } from 'transliteration/domain/markup'
import { wordFactory } from 'test-support/word-fixtures'
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
} from 'corpus/application/textService.testSupport'

const word: Word = wordFactory.build({
  _id: 'aklu I',
  lemma: ['aklu'],
  homonym: 'I',
})

const lemmatization = [
  [
    [
      [
        new LemmatizationToken('%n', false, null, null),
        new LemmatizationToken('kur-kur', true, [], []),
      ],
      [
        [
          new LemmatizationToken('kur', true, [], []),
          new LemmatizationToken('ra', true, [new Lemma(word)], []),
          new LemmatizationToken('...', false, null, null),
        ],
      ],
    ],
  ],
]

beforeEach(() => {
  setupProvenances()
})

test('findSuggestions', async () => {
  wordServiceMock.find.mockReturnValue(Bluebird.resolve(word))
  fragmentServiceMock.findSuggestions.mockReturnValue(Bluebird.resolve([]))
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
  apiClient.fetchJson.mockReturnValue(Bluebird.resolve(chapterWithReferences))
  bibliographyServiceMock.findManyById.mockReturnValueOnce(
    Bluebird.resolve(
      new Map([[translationReference.id, translationReference.document]]),
    ),
  )
  bibliographyServiceMock.findManyById.mockReturnValueOnce(
    Bluebird.resolve(
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
