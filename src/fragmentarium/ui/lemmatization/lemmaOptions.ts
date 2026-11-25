import _ from 'lodash'
import Word from 'dictionary/domain/Word'
import Lemma from 'transliteration/domain/Lemma'

export class LemmaOption extends Lemma {
  readonly id?: string
  word: Word
  isSuggestion?: boolean

  constructor(word: Word, isSuggestion = false) {
    super(word)
    this.word = word
    this.id = _.uniqueId('lemmaoption-')
    this.isSuggestion = isSuggestion
  }

  unsetSuggestion = (): LemmaOption => {
    return new LemmaOption(this.word)
  }
}

export interface LemmaSearch {
  searchLemma(query: string): Promise<readonly Word[]>
}

const namedEntityLanguages: readonly string[] = ['SUMERIAN', 'EMESAL']

function isNamedEntityLanguage(language: string | undefined): boolean {
  return language !== undefined && namedEntityLanguages.includes(language)
}

function isNamedEntity(word: Word): boolean {
  return (word.namedEntityTags ?? []).length > 0
}

export function searchLemmaOptions(
  search: LemmaSearch,
  inputValue: string,
  language: string | undefined,
): Promise<LemmaOption[]> {
  return search
    .searchLemma(inputValue)
    .then((words) =>
      isNamedEntityLanguage(language) ? words.filter(isNamedEntity) : words,
    )
    .then((words) => words.map((word) => new LemmaOption(word)))
}

export function createLemmaOptionsLoader(
  search: LemmaSearch,
  language: string | undefined,
): (inputValue: string, callback: (lemmas: LemmaOption[]) => void) => void {
  return (inputValue, callback): void => {
    searchLemmaOptions(search, inputValue, language)
      .then(callback)
      .catch(() => callback([]))
  }
}
