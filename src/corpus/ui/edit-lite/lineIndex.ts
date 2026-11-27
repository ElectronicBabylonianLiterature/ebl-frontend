import { LineOutline } from 'corpus/application/edit-lite/chapterOutline'

const primes = /[′’ʾ]/g
const trailingDot = /\.$/

export function findInitialIndex(
  initialLine: number | undefined,
  lineCount: number,
): number | null {
  return initialLine !== undefined &&
    Number.isInteger(initialLine) &&
    initialLine >= 0 &&
    initialLine < lineCount
    ? initialLine
    : null
}

function normalizeLineNumber(lineNumber: string): string {
  return lineNumber
    .trim()
    .replace(trailingDot, '')
    .replace(primes, "'")
    .toLowerCase()
}

export function findLineIndex(
  lines: readonly LineOutline[],
  lineNumber: string,
): number {
  const wantedLineNumber = normalizeLineNumber(lineNumber)
  return lines.findIndex(
    (line) => normalizeLineNumber(line.number) === wantedLineNumber,
  )
}

export function findInitialLine(
  lines: readonly LineOutline[],
  lineNumber: string | null,
): number | undefined {
  const index = lineNumber === null ? -1 : findLineIndex(lines, lineNumber)
  return index < 0 ? undefined : index
}
