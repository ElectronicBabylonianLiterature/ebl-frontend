import replaceSpecialCharacters from './replaceSpecialCharacters'
import normalizeNumbers from './normalizeNumbers'
import normalizeAccents from './normalizeAccents'
import _ from 'lodash'

function replaceAlternativeDamage(input: string): string {
  return input.replace(/[⸢⸣]/g, '')
}

export default function replaceTransliteration(
  transliteration: string
): string {
  return _(transliteration)
    .thru(replaceSpecialCharacters)
    .thru(normalizeNumbers)
    .thru(normalizeAccents)
    .thru(replaceAlternativeDamage)
    .value()
}
