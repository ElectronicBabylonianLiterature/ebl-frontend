import normalizeNumbers from 'fragmentarium/domain/normalizeNumbers'
import replaceSpecialCharacters from 'fragmentarium/domain/replaceSpecialCharacters'

const tokenWithTrailingPunctuation = /^(.*?)([,;.:!?]*)$/su

function normalizeToken(token: string): string {
  return token.replace(
    tokenWithTrailingPunctuation,
    (_match, core: string, punctuation: string) =>
      `${normalizeNumbers(replaceSpecialCharacters(false, false, core))}${punctuation}`,
  )
}

export default function normalizeSumerianQuery(query: string): string {
  return query.trim().split(/(\s+)/u).map(normalizeToken).join('')
}
