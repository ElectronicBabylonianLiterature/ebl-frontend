import replaceSpecialCharacters from './replaceSpecialCharacters'
import normalizeNumbers from './normalizeNumbers'
import normalizeAccents from './normalizeAccents'
import _ from 'lodash'

function replaceAlternativeDamage(input: string): string {
  return input.replace(/[⸢⸣]/g, '')
}

export default function replaceTransliteration(
  transliteration: string,
  replaceVowels = false,
  replaceConsonantsExtended = true,
  replaceNumbersAccentsAndDamage = true,
): string {
  const _transliteration = _(transliteration)
    .thru(
      replaceSpecialCharacters.bind(
        null,
        replaceVowels,
        replaceConsonantsExtended,
      ),
    )
    .value()

  if (replaceNumbersAccentsAndDamage) {
    return _(_transliteration)
      .thru(normalizeNumbers)
      .thru(normalizeAccents)
      .thru(replaceAlternativeDamage)
      .value()
  } else {
    return _transliteration
  }
}
