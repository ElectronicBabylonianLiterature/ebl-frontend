import replaceSpecialCharacters from './replaceSpecialCharacters'
import normalizeAccents from './normalizeAccents'

export default function replaceTransliteration (transliteration) {
  const replacedTransliteration = replaceSpecialCharacters(transliteration)
  return normalizeAccents(replacedTransliteration)
}
