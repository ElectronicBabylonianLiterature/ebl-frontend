import { ChapterDisplay } from 'corpus/domain/chapter'
import { ChapterId } from 'transliteration/domain/chapter-id'
import { ExtantLines } from 'corpus/domain/extant-lines'
import Word from 'dictionary/domain/Word'
import { museumNumberToString } from 'fragmentarium/domain/MuseumNumber'
import FragmentDto from 'fragmentarium/domain/FragmentDtos'
import { stringify } from 'query-string'
import { WordQuery } from 'dictionary/application/WordService'
import FakeApiBase from 'test-support/FakeApiBase'
import {
  createChapterUrl,
  createTextUrl,
  Dto,
} from 'test-support/FakeApiExpectation'

export default class FakeApi extends FakeApiBase {
  expectTexts(texts: Dto[]): FakeApi {
    return this.expectGet('/texts', texts)
  }

  expectProvenances(provenances: Dto[]): FakeApi {
    return this.expectGet('/provenances', provenances)
  }

  allowProvenances(provenances: Dto[]): FakeApi {
    return this.allowGet('/provenances', provenances)
  }

  expectProvenance(id: string, provenance: Dto): FakeApi {
    return this.expectGet(`/provenances/${id}`, provenance)
  }

  expectProvenanceChildren(id: string, children: Dto[]): FakeApi {
    return this.expectGet(`/provenances/${id}/children`, children)
  }

  allowProvenance(id: string, provenance: Dto): FakeApi {
    return this.allowGet(`/provenances/${id}`, provenance)
  }

  allowProvenanceChildren(id: string, children: Dto[]): FakeApi {
    return this.allowGet(`/provenances/${id}/children`, children)
  }

  allowText(text: Dto): FakeApi {
    return this.allowGet(createTextUrl(text), text)
  }

  allowChapter(chapter: ChapterId): FakeApi {
    return this.allowGet(createChapterUrl(chapter), chapter)
  }

  expectText(text: Dto): FakeApi {
    return this.expectGet(createTextUrl(text), text)
  }

  expectChapter(chapter: ChapterId): FakeApi {
    return this.expectGet(createChapterUrl(chapter), chapter)
  }

  expectChapterDisplay(chapter: ChapterDisplay): FakeApi {
    return this.expectGet(`${createChapterUrl(chapter.id)}/display`, {
      id: chapter.id,
      textHasDoi: chapter.textHasDoi,
      textName: chapter.textName,
      isSingleStage: chapter.isSingleStage,
      title: chapter.title,
      lines: chapter.lines,
      record: chapter.record,
    })
  }

  expectLineDetails(id: ChapterId, line: number, lineDetails: Dto): FakeApi {
    return this.expectGet(`${createChapterUrl(id)}/lines/${line}`, lineDetails)
  }

  expectManuscripts(id: ChapterId, manuscriptsDto: Dto[]): FakeApi {
    return this.expectGet(`${createChapterUrl(id)}/manuscripts`, manuscriptsDto)
  }

  expectExtantLines(id: ChapterId, extantLines: ExtantLines): FakeApi {
    return this.expectGet(`${createChapterUrl(id)}/extant_lines`, extantLines)
  }

  expectUpdateManuscripts(chapter: ChapterId, manuscripts: Dto): FakeApi {
    return this.expectPost(
      `${createChapterUrl(chapter)}/manuscripts`,
      manuscripts,
      chapter,
    )
  }

  expectUpdateAlignment(chapter: ChapterId, alignment: Dto): FakeApi {
    return this.expectPost(
      `${createChapterUrl(chapter)}/alignment`,
      alignment,
      chapter,
    )
  }

  expectUpdateLemmatization(chapter: ChapterId, lemmatization: Dto): FakeApi {
    return this.expectPost(
      `${createChapterUrl(chapter)}/lemmatization`,
      lemmatization,
      chapter,
    )
  }

  expectUpdateLines(chapter: ChapterId, lines: Dto): FakeApi {
    return this.expectPost(`${createChapterUrl(chapter)}/lines`, lines, chapter)
  }

  expectImportChapter(chapter: ChapterId, atf: string): FakeApi {
    return this.expectPost(
      `${createChapterUrl(chapter)}/import`,
      { atf },
      chapter,
      false,
    )
  }

  expectAnnotations(number: string, annotationDtos: readonly Dto[]): FakeApi {
    return this.expectGet(
      `/fragments/${number}/annotations?generateAnnotations=false`,
      { annotations: annotationDtos },
    )
  }

  expectUpdateAnnotations(
    number: string,
    annotationDtos: readonly Dto[],
  ): FakeApi {
    return this.expectPost(
      `/fragments/${number}/annotations`,
      { fragmentNumber: number, annotations: annotationDtos },
      { annotations: annotationDtos },
    )
  }

  expectFragment(fragmentDto: FragmentDto): FakeApi {
    return this.expectGet(
      `/fragments/${museumNumberToString(fragmentDto.museumNumber)}`,
      fragmentDto,
    )
  }

  expectPhoto(
    number: string,
    photo: { blobParts: string[]; options: { type: string } },
  ): FakeApi {
    return this.expectGet(`/fragments/${number}/photo`, photo, true)
  }

  expectSearchWords(query: WordQuery, words: readonly Word[]): FakeApi {
    return this.expectGet(
      `/words?query=${encodeURIComponent(
        stringify(query, { skipEmptyString: true }),
      )}`,
      words,
    )
  }

  expectWord(word: Word): FakeApi {
    return this.expectGet(`/words/${encodeURIComponent(word._id)}`, word)
  }

  expectUpdateWord(word: Word): FakeApi {
    return this.expectPost(`/words/${encodeURIComponent(word._id)}`, word, word)
  }

  allowStatistics(statistics: Dto): FakeApi {
    return this.allowGet('/statistics', statistics)
  }

  allowDossiers(dossiers: Dto[]): FakeApi {
    return this.allowGet('/dossiers', dossiers)
  }

  allowGenres(genres: string[][]): FakeApi {
    return this.allowGet('/genres', genres)
  }

  allowLatestFragments(queryResult: Dto): FakeApi {
    return this.allowGet('/fragments/latest', queryResult)
  }

  allowImage(file: string): FakeApi {
    return this.allowGet(`/images/${file}`, {}, true)
  }
}
