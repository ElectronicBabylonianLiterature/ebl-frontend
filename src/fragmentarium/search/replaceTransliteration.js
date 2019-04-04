import replaceSpecialCharacters from './replaceSpecialCharacters'
import normalizeNumbers from './normalizeNumbers'
import normalizeAccents from './normalizeAccents'

export default function replaceTransliteration (transliteration) {
  const replacedTransliteration = replaceSpecialCharacters(transliteration)
  const normalizedNumbers = normalizeNumbers(replacedTransliteration)
  return normalizeAccents(normalizedNumbers)
}
