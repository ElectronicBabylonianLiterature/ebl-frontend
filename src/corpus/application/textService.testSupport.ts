import Bluebird from 'bluebird'
import BibliographyService from 'bibliography/application/BibliographyService'
import createReference from 'bibliography/application/createReference'
import { ChapterDisplay } from 'corpus/domain/chapter'
import TextService from 'corpus/application/TextService'
import WordService from 'dictionary/application/WordService'
import FragmentService from 'fragmentarium/application/FragmentService'
import ApiClient from 'http/ApiClient'
import { chapter } from 'test-support/test-corpus-text'
import { chapterDisplayDtoFactory } from 'test-support/chapter-fixtures'
import TranslationLine from 'transliteration/domain/translation-line'
import { NoteLine } from 'transliteration/domain/note-line'
import { ParallelLine } from 'transliteration/domain/parallel-line'
import { fromTransliterationLineDto } from 'transliteration/application/dtos'

jest.mock('bibliography/application/BibliographyService')
jest.mock('dictionary/application/WordService')
jest.mock('fragmentarium/application/FragmentService')
jest.mock('http/ApiClient')

export const apiClient = new (ApiClient as jest.Mock<jest.Mocked<ApiClient>>)()
export const MockBibliographyService = BibliographyService as jest.Mock<
  jest.Mocked<BibliographyService>
>
export const bibliographyServiceMock = new MockBibliographyService()
export const MockFragmentService = FragmentService as jest.Mock<
  jest.Mocked<FragmentService>
>
export const fragmentServiceMock = new MockFragmentService()
export const MockWordService = WordService as jest.Mock<
  jest.Mocked<WordService>
>
export const wordServiceMock = new MockWordService()
export const testService = new TextService(
  apiClient,
  fragmentServiceMock,
  wordServiceMock,
  bibliographyServiceMock,
)

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

export function setupProvenances(): void {
  fragmentServiceMock.fetchProvenances.mockReturnValue(Bluebird.resolve([]))
}
