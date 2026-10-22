import normalizeNumbers from 'fragmentarium/domain/normalizeNumbers'
import replaceSpecialCharacters from 'fragmentarium/domain/replaceSpecialCharacters'

const tokenWithTrailingPunctuation = /^(.*?)([,;.:!?]*)$/su
const separatingComma = /,(?![aeiuāēīūâêîûAEIUĀĒĪŪÂÊÎÛ\d-])/u

function normalizeTransliteration(text: string): string {
  return normalizeNumbers(replaceSpecialCharacters(false, false, text))
}

function normalizeToken(token: string): string {
  return token.replace(
    tokenWithTrailingPunctuation,
    (_match, core: string, punctuation: string) =>
      `${core.split(separatingComma).map(normalizeTransliteration).join(',')}${punctuation}`,
  )
}

export default function normalizeSumerianQuery(query: string): string {
  return query.trim().split(/(\s+)/u).map(normalizeToken).join('')
}
