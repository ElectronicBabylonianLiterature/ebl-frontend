import romans from 'romans'
import Word from 'dictionary/domain/Word'
import compareAkkadianStrings from './compareAkkadianStrings'

export default function compareWord(first: Word, second: Word): number {
  const lemmaResult = compareAkkadianStrings(
    first.lemma.join(' '),
    second.lemma.join(' '),
  )
  const homonymResult =
    romans.deromanize(first.homonym) - romans.deromanize(second.homonym)
  return lemmaResult || homonymResult
}
