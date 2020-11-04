import Promise from 'bluebird'
import { GlossaryData } from 'transliteration/domain/glossary'
import produce, { Draft, castDraft } from 'immer'
import WordService from 'dictionary/application/WordService'
import DictionaryWord from 'dictionary/domain/Word'
import { Text } from 'transliteration/domain/text'

function isDictionaryWord(word: DictionaryWord | null): word is DictionaryWord {
  return word !== null
}

export default class GlossaryFactory {
  private readonly dictionary: WordService

  constructor(dictionary: WordService) {
    this.dictionary = dictionary
  }

  createGlossary(text: Text): Promise<GlossaryData> {
    return new Promise((resolve, reject) => {
      produce(text.glossary, async (draft: Draft<GlossaryData>) => {
        for (const [, tokens] of draft) {
          for (const token of tokens) {
            const word = await this.dictionary
              .find(token.uniqueLemma)
              .catch(() => null)
            if (isDictionaryWord(word)) {
              token.dictionaryWord = castDraft(word)
            }
          }
        }
      })
        .then(resolve)
        .catch(reject)
    })
  }
}
