import Promise from 'bluebird'
import DictionaryWord from 'dictionary/domain/Word'
import _ from 'lodash'
import Lemma from 'transliteration/domain/Lemma'
import Lemmatization, {
  UniqueLemma,
  LemmatizationToken,
} from 'transliteration/domain/Lemmatization'
import { Text } from 'transliteration/domain/text'
import { LemmatizableToken, Token } from 'transliteration/domain/token'
import { FragmentService } from './FragmentService'

export abstract class AbstractLemmatizationFactory<T, U> {
  private readonly findSuggestions: (
    value: string,
    isNormalized: boolean,
  ) => Promise<readonly UniqueLemma[]>
  private readonly findWord: (word: string) => Promise<DictionaryWord>

  constructor(
    fragmentService: FragmentService,
    wordRepository: { find(word: string): Promise<DictionaryWord> },
  ) {
    this.findSuggestions = _.memoize(
      _.bind(fragmentService.findSuggestions, fragmentService),
      (...args: Parameters<typeof fragmentService.findSuggestions>) =>
        String(args),
    )
    this.findWord = _.memoize(_.bind(wordRepository.find, wordRepository))
  }

  abstract createLemmatization(text: T): Promise<U>

  protected createLemmatizationLine(
    tokens: readonly Token[],
  ): Promise<LemmatizationToken[]> {
    return Promise.mapSeries(tokens, (token) =>
      token.lemmatizable
        ? Promise.all([
            this.createLemmas(token),
            this.createSuggestions(token),
          ]).then(
            ([lemmas, suggestions]) =>
              new LemmatizationToken(token.value, true, lemmas, suggestions),
          )
        : Promise.resolve(new LemmatizationToken(token.value, false)),
    )
  }

  private createSuggestions(
    token: LemmatizableToken,
  ): Promise<readonly UniqueLemma[]> {
    return _.isEmpty(token.uniqueLemma)
      ? this.findSuggestions(token.cleanValue, token.normalized)
      : Promise.resolve([])
  }

  protected createLemmas(token: LemmatizableToken): Promise<UniqueLemma> {
    return Promise.mapSeries(token.uniqueLemma, (lemma) =>
      this.findWord(lemma).then((word: DictionaryWord) => new Lemma(word)),
    )
  }
}
export default class LemmatizationFactory extends AbstractLemmatizationFactory<
  Text,
  Lemmatization
> {
  createLemmatization(text: Text): Promise<Lemmatization> {
    return Promise.mapSeries(text.allLines, (line) =>
      this.createLemmatizationLine(line.content),
    ).then(
      (lines) =>
        new Lemmatization(
          text.allLines.map((line) => line.prefix),
          lines,
        ),
    )
  }
}
