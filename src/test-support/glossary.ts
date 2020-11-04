import factory from 'factory-girl'
import { GlossaryToken } from 'transliteration/domain/glossary'
import Label from 'transliteration/domain/Label'
import { Word } from 'transliteration/domain/token'
import DictionaryWord from 'dictionary/domain/Word'

export function createGlossaryToken(
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

export async function createDictionaryWord(
  wordId: string
): Promise<DictionaryWord> {
  const [lemma, homonym] = wordId.split(' ')
  return await factory.build('word', {
    _id: wordId,
    lemma: [lemma],
    homonym: homonym,
    guideWord: `GW for ${wordId}`,
  })
}
