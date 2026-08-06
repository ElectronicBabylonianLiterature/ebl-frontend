import TextService from 'corpus/application/TextService'
import WordService from 'dictionary/application/WordService'
import FragmentService from 'fragmentarium/application/FragmentService'
import BibliographyService from 'bibliography/application/BibliographyService'
import ApiClient from 'http/ApiClient'
import Word from 'dictionary/domain/Word'
import { chapter } from 'test-support/test-corpus-text'
import { ExtantLines } from 'corpus/domain/extant-lines'
import { ChapterDisplay } from 'corpus/domain/chapter'
import { chapterDisplayDtoFactory } from 'test-support/chapter-fixtures'
import {
  cslDataFactory,
  referenceDtoFactory,
} from 'test-support/bibliography-fixtures'
import TranslationLine from 'transliteration/domain/translation-line'
import { NoteLine } from 'transliteration/domain/note-line'
import { ParallelLine } from 'transliteration/domain/parallel-line'
import { fromTransliterationLineDto } from 'transliteration/application/dtos'
import { wordFactory } from 'test-support/word-fixtures'
import createReference from 'bibliography/application/createReference'

export interface TextServiceTestContext {
  apiClient: jest.Mocked<ApiClient>
  fragmentServiceMock: jest.Mocked<FragmentService>
  wordServiceMock: jest.Mocked<WordService>
  bibliographyServiceMock: jest.Mocked<BibliographyService>
  textService: TextService
  createService: (getCacheScope?: () => string) => TextService
}

export function createTextServiceTestContext(): TextServiceTestContext {
  const apiClient = new (ApiClient as jest.Mock<jest.Mocked<ApiClient>>)()
  const fragmentServiceMock = new (FragmentService as jest.Mock<
    jest.Mocked<FragmentService>
  >)()
  const wordServiceMock = new (WordService as jest.Mock<
    jest.Mocked<WordService>
  >)()
  const bibliographyServiceMock = new (BibliographyService as jest.Mock<
    jest.Mocked<BibliographyService>
  >)()
  const createService = (getCacheScope?: () => string): TextService =>
    new TextService(
      apiClient,
      fragmentServiceMock,
      wordServiceMock,
      bibliographyServiceMock,
      getCacheScope,
    )

  return {
    apiClient: apiClient,
    fragmentServiceMock: fragmentServiceMock,
    wordServiceMock: wordServiceMock,
    bibliographyServiceMock: bibliographyServiceMock,
    textService: createService(),
    createService: createService,
  }
}

export const word: Word = wordFactory.build({
  _id: 'aklu I',
  lemma: ['aklu'],
  homonym: 'I',
})

export const extantLines: ExtantLines = {
  NinNA1a: {
    o: [
      {
        lineNumber: {
          number: 1,
          hasPrime: false,
          suffixModifier: null,
          prefixModifier: null,
        },
        isSideBoundary: false,
      },
    ],
  },
}

export const chapterDisplayDto = chapterDisplayDtoFactory.build()

export const chapterDisplay = new ChapterDisplay(
  chapterDisplayDto.id,
  chapterDisplayDto.textHasDoi,
  chapterDisplayDto.textName,
  chapterDisplayDto.isSingleStage,
  chapterDisplayDto.title,
  chapterDisplayDto.lines.map((dto, index) => ({
    ...dto,
    originalIndex: index,
    oldLineNumbers:
      dto.oldLineNumbers?.map((oldLineNumberDto) => ({
        number: oldLineNumberDto.number,
        reference: createReference(oldLineNumberDto.reference),
      })) ?? [],
    translation: dto.translation.map(
      (translation) => new TranslationLine(translation),
    ),
    variants: dto.variants.map((variant, index) => ({
      ...variant,
      reconstruction: variant.reconstruction.map((token, index) => ({
        ...token,
        sentenceIndex: index,
      })),
      note: variant.note && new NoteLine(variant.note),
      parallelLines: variant.parallelLines.map(
        (parallel) => fromTransliterationLineDto(parallel) as ParallelLine,
      ),
      isPrimaryVariant: index === 0,
    })),
  })),
  chapterDisplayDto.record,
  chapterDisplayDto.atf,
)

export const chapterId = chapter.id

export const chapterUrl = `/texts/${encodeURIComponent(
  chapter.textId.genre,
)}/${encodeURIComponent(chapter.textId.category)}/${encodeURIComponent(
  chapter.textId.index,
)}/chapters/${encodeURIComponent(chapter.stage)}/${encodeURIComponent(
  chapter.name,
)}`

const cslData = cslDataFactory.build()

export const oldSiglumReferenceDto = referenceDtoFactory.build(
  {},
  { associations: { document: cslData } },
)
