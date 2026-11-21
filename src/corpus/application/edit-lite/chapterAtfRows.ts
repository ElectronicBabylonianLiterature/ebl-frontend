const singleLineNumber = "(?:[A-Za-z]\\+)?\\d+['′’ʾ]*[A-Za-z]?"
const lineNumber = `${singleLineNumber}(?:-${singleLineNumber})?`
const reconstructionRowPattern = new RegExp(`^(${lineNumber})\\.(?:\\s+(.*))?$`)
const lineNumberTokenPattern = new RegExp(`^${lineNumber}\\.$`)
const headerRowPattern = /^(?:&|#project:|#atf:)/
const translationRowPattern = /^#tr[.:]/
const noteRowPattern = /^#note:/
const parallelRowPattern = /^\/\//
const dollarRowPattern = /^\$/
const annotationRowPattern = /^(?:#|\$|\/\/|&|@)/
const openingEnclosureTokenPattern = /^[[(<]+$/
const closingEnclosureTokenPattern = /^[\])>]+$/

export interface ReconstructionRow {
  readonly number: string
  readonly text: string
}

export interface ManuscriptRow {
  readonly siglum: string
  readonly labels: readonly string[]
  readonly number: string
  readonly text: string
}

export function isHeaderRow(row: string): boolean {
  return headerRowPattern.test(row)
}

export function isTranslationRow(row: string): boolean {
  return translationRowPattern.test(row)
}

export function isReconstructionExtensionRow(row: string): boolean {
  return noteRowPattern.test(row) || parallelRowPattern.test(row)
}

export function isParatextRow(row: string): boolean {
  return noteRowPattern.test(row) || dollarRowPattern.test(row)
}

function joinReconstructionTokens(text: string): string {
  return text
    .split(/\s+/)
    .reduce(
      (joined, token, index, tokens) =>
        index === 0 ||
        openingEnclosureTokenPattern.test(tokens[index - 1]) ||
        closingEnclosureTokenPattern.test(token)
          ? `${joined}${token}`
          : `${joined} ${token}`,
      '',
    )
}

export function parseReconstructionRow(row: string): ReconstructionRow | null {
  const match = reconstructionRowPattern.exec(row)
  return match
    ? {
        number: match[1],
        text: joinReconstructionTokens((match[2] ?? '').trim()),
      }
    : null
}

export function parseManuscriptRow(row: string): ManuscriptRow | null {
  const tokens = annotationRowPattern.test(row)
    ? []
    : Array.from(row.matchAll(/\S+/g))
  const numberToken = tokens.find(
    (token, index) => index > 0 && lineNumberTokenPattern.test(token[0]),
  )
  return numberToken
    ? {
        siglum: tokens[0][0],
        labels: tokens
          .slice(1, tokens.indexOf(numberToken))
          .map(([label]) => label),
        number: numberToken[0].slice(0, -1),
        text: row.slice(numberToken.index + numberToken[0].length).trim(),
      }
    : null
}
