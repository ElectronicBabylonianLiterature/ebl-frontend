import { GlossaryToken } from 'transliteration/domain/glossary'
import Label from 'transliteration/domain/Label'
import { Word } from 'transliteration/domain/token'
import DictionaryWord from 'dictionary/domain/Word'
import { wordFactory } from './word-fixtures'

export function createGlossaryToken(
  label: Label,
  word: Word,
  lemmaIndex: number,
  dictionaryWord: DictionaryWord,
): GlossaryToken {
  return {
    label: label,
    value: word.value,
    word: word,
    uniqueLemma: word.uniqueLemma[lemmaIndex],
    dictionaryWord: dictionaryWord,
  }
}

export function createDictionaryWord(wordId: string): DictionaryWord {
  const [lemma, homonym] = wordId.split(' ')
  return wordFactory.build({
    _id: wordId,
    lemma: [lemma],
    homonym: homonym,
    guideWord: `GW for ${wordId}`,
  })
}
