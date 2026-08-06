import mapSeries from 'common/utils/mapSeries'
import _ from 'lodash'

import { Chapter } from 'corpus/domain/chapter'
import {
  ChapterLemmatization,
  LineLemmatization,
} from 'corpus/domain/lemmatization'
import { LineVariant, ManuscriptLine } from 'corpus/domain/line'

import { AbstractLemmatizationFactory } from 'fragmentarium/application/LemmatizationFactory'
import {
  LemmatizationToken,
  UniqueLemma,
} from 'transliteration/domain/Lemmatization'
import { Token } from 'transliteration/domain/token'

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

  private applySuggestion(
    lemmatizationToken: LemmatizationToken,
    atfToken: Token,
    reconstruction: LemmatizationToken[],
  ): LemmatizationToken {
    const suggestion = this.getSuggestion(atfToken, reconstruction)
    return lemmatizationToken.hasLemma || _.isEmpty(suggestion)
      ? lemmatizationToken.applySuggestion()
      : lemmatizationToken.setUniqueLemma(suggestion as UniqueLemma, true)
  }

  private getSuggestion(
    atfToken: Token,
    reconstruction: LemmatizationToken[],
  ): UniqueLemma | null {
    return _.isNil(atfToken.alignment)
      ? null
      : reconstruction[atfToken.alignment].uniqueLemma
  }
}

export default CorpusLemmatizationFactory
