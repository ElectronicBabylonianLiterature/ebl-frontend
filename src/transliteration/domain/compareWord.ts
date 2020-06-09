import { romanToNumber } from 'big-roman'
import Word from 'dictionary/domain/Word'
import compareAkkadianStrings from './compareAkkadianStrings'

export default function compareWord(first: Word, second: Word): number {
  const lemmaResult = compareAkkadianStrings(
    first.lemma.join(' '),
    second.lemma.join(' ')
  )
  const homonymResult =
    romanToNumber(first.homonym) - romanToNumber(second.homonym)
  return lemmaResult || homonymResult
}
