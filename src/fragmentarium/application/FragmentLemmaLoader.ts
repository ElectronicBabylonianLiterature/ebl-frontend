import _ from 'lodash'
import DictionaryWord from 'dictionary/domain/Word'
import Word from 'dictionary/domain/Word'
import Lemma from 'transliteration/domain/Lemma'
import Lemmatization, {
  UniqueLemma,
} from 'transliteration/domain/Lemmatization'
import { Text } from 'transliteration/domain/text'
import WordRepository from 'dictionary/infrastructure/WordRepository'
import LemmatizationFactory from 'fragmentarium/application/LemmatizationFactory'
import { LemmaSuggestions } from 'fragmentarium/ui/fragment/lemma-annotation/LemmaAnnotation'
import { FragmentRepository } from 'fragmentarium/application/FragmentRepositoryTypes'
import { LemmaSuggestionSource } from 'fragmentarium/application/LemmatizationFactory'

export default class FragmentLemmaLoader {
  constructor(
    private readonly fragmentRepository: FragmentRepository,
    private readonly wordRepository: WordRepository,
    private readonly fragmentService: LemmaSuggestionSource,
  ) {}

  searchLemma(lemma: string): Promise<readonly Word[]> {
    return _.isEmpty(lemma)
      ? Promise.resolve([])
      : this.wordRepository.searchLemma(lemma)
  }

  createLemmatization(text: Text): Promise<Lemmatization> {
    return new LemmatizationFactory(
      this.fragmentService,
      this.wordRepository,
    ).createLemmatization(text)
  }

  findSuggestions(
    value: string,
    isNormalized: boolean,
  ): Promise<ReadonlyArray<UniqueLemma>> {
    return this.fragmentRepository
      .findLemmas(value, isNormalized)
      .then((lemmas: DictionaryWord[][]) =>
        lemmas.map((complexLemma: DictionaryWord[]) =>
          complexLemma.map((word: DictionaryWord) => new Lemma(word)),
        ),
      )
  }

  collectLemmaSuggestions(number: string): Promise<LemmaSuggestions> {
    return this.fragmentRepository.collectLemmaSuggestions(number)
  }
}
