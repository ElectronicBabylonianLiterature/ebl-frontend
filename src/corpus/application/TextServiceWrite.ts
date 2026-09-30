import Bluebird from 'bluebird'

import {
  fromChapterDto,
  toAlignmentDto,
  toLemmatizationDto,
  toLinesDto,
  toManuscriptsDto,
} from 'corpus/application/dtos'
import {
  createChapterUrl,
  preloadProvenances,
} from 'corpus/application/textServiceCore'
import { ChapterAlignment } from 'corpus/domain/alignment'
import { Chapter } from 'corpus/domain/chapter'
import {
  ChapterLemmatization,
  LineLemmatization,
} from 'corpus/domain/lemmatization'
import { Line, LineVariant, ManuscriptLine } from 'corpus/domain/line'
import { Manuscript } from 'corpus/domain/manuscript'
import WordService from 'dictionary/application/WordService'
import FragmentService from 'fragmentarium/application/FragmentService'
import { AbstractLemmatizationFactory } from 'fragmentarium/application/LemmatizationFactory'
import ApiClient from 'http/ApiClient'
import { ChapterId } from 'transliteration/domain/chapter-id'
import { LemmatizationToken } from 'transliteration/domain/Lemmatization'

class CorpusLemmatizationFactory extends AbstractLemmatizationFactory<
  Chapter,
  ChapterLemmatization
> {
  createLemmatization(chapter: Chapter): Bluebird<ChapterLemmatization> {
    return Bluebird.mapSeries(chapter.lines, (line) =>
      Bluebird.mapSeries(line.variants, (variant) =>
        this.lemmatizeVariant(variant),
      ),
    )
  }

  private lemmatizeVariant(variant: LineVariant): Bluebird<LineLemmatization> {
    return this.createLemmatizationLine(variant.reconstructionTokens)
      .then((reconstruction) =>
        reconstruction.map((token) => token.applySuggestion()),
      )
      .then((reconstruction) =>
        Bluebird.mapSeries(variant.manuscripts, (manuscript) =>
          this.lemmatizeManuscript(manuscript),
        ).then((manuscripts) => [reconstruction, manuscripts]),
      )
  }

  private lemmatizeManuscript(
    manuscript: ManuscriptLine,
  ): Bluebird<LemmatizationToken[]> {
    return Bluebird.mapSeries(manuscript.atfTokens, (token) =>
      token.lemmatizable
        ? this.createLemmas(token).then(
            (lemmas) => new LemmatizationToken(token.value, true, lemmas, []),
          )
        : new LemmatizationToken(token.value, false),
    )
  }
}

export default class TextServiceWrite {
  constructor(
    private readonly apiClient: ApiClient,
    private readonly fragmentService: FragmentService,
    private readonly wordService: WordService,
  ) {}

  updateAlignment(
    id: ChapterId,
    alignment: ChapterAlignment,
  ): Bluebird<Chapter> {
    return this.update(id, 'alignment', toAlignmentDto(alignment))
  }

  updateLemmatization(
    id: ChapterId,
    lemmatization: ChapterLemmatization,
  ): Bluebird<Chapter> {
    return this.update(id, 'lemmatization', toLemmatizationDto(lemmatization))
  }

  updateManuscripts(
    id: ChapterId,
    manuscripts: readonly Manuscript[],
    uncertainChapters: readonly string[],
  ): Bluebird<Chapter> {
    return this.update(
      id,
      'manuscripts',
      toManuscriptsDto(manuscripts, uncertainChapters),
    )
  }

  updateLines(id: ChapterId, lines: readonly Line[]): Bluebird<Chapter> {
    return this.update(id, 'lines', toLinesDto(lines))
  }

  importChapter(id: ChapterId, atf: string): Bluebird<Chapter> {
    return this.update(id, 'import', { atf })
  }

  findSuggestions(chapter: Chapter): Bluebird<ChapterLemmatization> {
    return new CorpusLemmatizationFactory(
      this.fragmentService,
      this.wordService,
    ).createLemmatization(chapter)
  }

  private update(
    id: ChapterId,
    path: 'alignment' | 'lemmatization' | 'manuscripts' | 'lines' | 'import',
    dto: unknown,
  ): Bluebird<Chapter> {
    return preloadProvenances(this.fragmentService)
      .then(() =>
        this.apiClient.postJson(`${createChapterUrl(id)}/${path}`, dto),
      )
      .then(fromChapterDto)
  }
}
