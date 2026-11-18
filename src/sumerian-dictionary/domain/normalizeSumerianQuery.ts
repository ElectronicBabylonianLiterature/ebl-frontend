import normalizeNumbers from 'fragmentarium/domain/normalizeNumbers'
import replaceSpecialCharacters from 'fragmentarium/domain/replaceSpecialCharacters'

const tokenWithTrailingPunctuation = /^(.*?)([,;.:!?]*)$/su
const separatingComma = /,(?![aeiuāēīūâêîûAEIUĀĒĪŪÂÊÎÛ\d-])/u
const transliterationMarker = /[\d₀-₉{}\-šṣṭĝḫ]|sz/iu
const lowercaseLetter = /\p{Ll}/u

function normalizeTransliteration(text: string): string {
  return normalizeNumbers(replaceSpecialCharacters(false, false, text))
}

function isTransliteration(text: string): boolean {
  return transliterationMarker.test(text) || !lowercaseLetter.test(text)
}

function normalizeCore(core: string): string {
  return core
    .split(isTransliteration(core) ? separatingComma : ',')
    .map(normalizeTransliteration)
    .join(',')
}

function normalizeToken(token: string): string {
  return token.replace(
    tokenWithTrailingPunctuation,
    (_match, core: string, punctuation: string) =>
      `${normalizeCore(core)}${punctuation}`,
  )
}

export default function normalizeSumerianQuery(query: string): string {
  return query.trim().split(/(\s+)/u).map(normalizeToken).join('')
}
