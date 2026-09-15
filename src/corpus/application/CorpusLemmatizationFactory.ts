import mapSeries from 'common/utils/mapSeries'

import { Chapter } from 'corpus/domain/chapter'
import {
  ChapterLemmatization,
  LineLemmatization,
} from 'corpus/domain/lemmatization'
import { LineVariant, ManuscriptLine } from 'corpus/domain/line'

import { AbstractLemmatizationFactory } from 'fragmentarium/application/LemmatizationFactory'
import { LemmatizationToken } from 'transliteration/domain/Lemmatization'

export class CorpusLemmatizationFactory extends AbstractLemmatizationFactory<
  Chapter,
  ChapterLemmatization
> {
  createLemmatization(chapter: Chapter): Promise<ChapterLemmatization> {
    return mapSeries(chapter.lines, (line) =>
      mapSeries(line.variants, (variant) => this.lemmatizeVariant(variant)),
    )
  }

  private lemmatizeVariant(variant: LineVariant): Promise<LineLemmatization> {
    return this.createLemmatizationLine(variant.reconstructionTokens)
      .then((reconstruction) =>
        reconstruction.map((token) => token.applySuggestion()),
      )
      .then((reconstruction) =>
        mapSeries(variant.manuscripts, (manuscript) =>
          this.lemmatizeManuscript(manuscript),
        ).then((lemmatizedManuscripts) => [
          reconstruction,
          lemmatizedManuscripts,
        ]),
      )
  }

  private lemmatizeManuscript(
    manuscript: ManuscriptLine,
  ): Promise<LemmatizationToken[]> {
    return mapSeries(manuscript.atfTokens, (token) =>
      token.lemmatizable
        ? this.createLemmas(token).then(
            (lemmas) => new LemmatizationToken(token.value, true, lemmas, []),
          )
        : new LemmatizationToken(token.value, false),
    )
  }
}

export default CorpusLemmatizationFactory
