import SignService from 'signs/application/SignService'
import { UnicodeAtf } from 'signs/domain/Sign'
import ConcurrencyLimiter from 'common/utils/ConcurrencyLimiter'
import { isCancellation } from 'common/utils/abortError'
import replaceTransliteration from 'fragmentarium/domain/replaceTransliteration'
import { displayUnicode } from 'signs/ui/search/SignsSearch'

const conversionConcurrencyLimit = 4
const wordSeparatorCode = 9999

export type ReportError = (error: unknown) => void

type LineToConvert = {
  index: number
  line: string
}

function toCuneiform(result: readonly UnicodeAtf[]): string {
  return result
    .map((entry) =>
      entry.unicode[0] === wordSeparatorCode
        ? ' '
        : displayUnicode(entry.unicode),
    )
    .join('')
}

function convertLine(
  signService: SignService,
  line: string,
  signal: AbortSignal,
  reportError: ReportError,
): Promise<string> {
  return signService
    .getUnicodeFromAtf(line, signal)
    .then(toCuneiform)
    .catch((error) => {
      if (isCancellation(error, signal)) {
        throw error
      }
      reportError(error)
      return ''
    })
}

function linesToConvert(lines: readonly string[]): LineToConvert[] {
  return lines
    .map((line, index) => ({ index, line }))
    .filter(({ line }) => line.trim() !== '')
}

export default function convertAtfLines(
  signService: SignService,
  content: string,
  signal: AbortSignal,
  reportError: ReportError,
): Promise<string> {
  const lines = content
    .split('\n')
    .map((line) => replaceTransliteration(line.toLowerCase()))
  const limiter = new ConcurrencyLimiter(conversionConcurrencyLimit)

  return Promise.all(
    linesToConvert(lines).map(({ index, line }) =>
      limiter
        .run(() => convertLine(signService, line, signal, reportError), signal)
        .then((value): [number, string] => [index, value]),
    ),
  ).then((converted) => {
    const convertedByIndex = new Map(converted)
    return lines.map((_, index) => convertedByIndex.get(index) ?? '').join('\n')
  })
}
