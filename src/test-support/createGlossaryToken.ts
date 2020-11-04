import { GlossaryToken } from 'transliteration/domain/glossary'
import Label from 'transliteration/domain/Label'
import { Word } from 'transliteration/domain/token'
import DictionaryWord from 'dictionary/domain/Word'

export default function createGlossaryToken(
  label: Label,
  word: Word,
  lemmaIndex: number,
  dictionaryWord: DictionaryWord
): GlossaryToken {
  return {
    label: label,
    value: word.value,
    word: word,
    uniqueLemma: word.uniqueLemma[lemmaIndex],
    dictionaryWord: dictionaryWord,
  }
}
