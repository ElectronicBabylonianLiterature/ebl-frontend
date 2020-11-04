import { GlossaryToken } from 'transliteration/domain/glossary'
import Label from 'transliteration/domain/Label'
import { Word } from 'transliteration/domain/token'

export default function createGlossaryToken(
  label: Label,
  word: Word,
  lemmaIndex = 0
): GlossaryToken {
  return {
    label: label,
    value: word.value,
    word: word,
    uniqueLemma: word.uniqueLemma[lemmaIndex],
  }
}
