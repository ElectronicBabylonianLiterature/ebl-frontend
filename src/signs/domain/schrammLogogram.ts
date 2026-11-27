import { compareCleanedAkkadianString } from 'dictionary/domain/compareAkkadianStrings'
import { Logogram } from 'signs/domain/Sign'

export interface SchrammEntry {
  readonly akkadian: string
  readonly uncertain: boolean
  readonly meaning: string
  readonly references: string
}

function closingParenthesis(text: string, start: number): number {
  let depth = 0
  for (let index = start; index < text.length; index++) {
    if (text[index] === '(') {
      depth++
    } else if (text[index] === ')' && --depth === 0) {
      return index
    }
  }
  return text.length
}

export function parseSchrammLogogram(schramm: string): SchrammEntry | null {
  const separator = schramm.indexOf(';')
  if (separator < 0) {
    return null
  }
  let rest = schramm.slice(separator + 1).trim()
  const akkadian = rest.match(/^\*([^*]+)\*/)
  if (!akkadian) {
    return null
  }
  rest = rest.slice(akkadian[0].length).trimStart()
  const uncertain = rest.startsWith('(?)')
  if (uncertain) {
    rest = rest.slice(3).trimStart()
  }
  let meaning = ''
  if (rest.startsWith('(')) {
    const end = closingParenthesis(rest, 0)
    meaning = rest.slice(1, end)
    rest = rest.slice(end + 1)
  }
  return {
    akkadian: akkadian[1],
    uncertain,
    meaning,
    references: rest.replace(/^\s*;\s*/, '').trim(),
  }
}

export function isLogogramCrossReference(logogram: Logogram): boolean {
  return logogram.wordId.length === 0 && logogram.logogram.includes('→')
}

export interface LogogramSpelling {
  readonly id: string
  readonly logogram: string
  readonly schramm: SchrammEntry | null
}

export interface LogogramsOfWord {
  readonly wordId: string
  readonly lemma: string
  readonly otherWordIds: readonly string[]
  readonly spellings: readonly LogogramSpelling[]
}

export function groupLogogramsByWord(
  logograms: readonly Logogram[],
): readonly LogogramsOfWord[] {
  const groups = new Map<
    string,
    { otherWordIds: Set<string>; spellings: LogogramSpelling[] }
  >()
  logograms
    .filter((logogram) => logogram.wordId.length > 0)
    .forEach((logogram) => {
      const [wordId, ...others] = logogram.wordId
      const group = groups.get(wordId) ?? {
        otherWordIds: new Set<string>(),
        spellings: [],
      }
      others.forEach((other) => group.otherWordIds.add(other))
      const id = `${logogram.logogram}\u0000${logogram.schrammLogogramme}`
      if (!group.spellings.some((spelling) => spelling.id === id)) {
        group.spellings.push({
          id,
          logogram: logogram.logogram,
          schramm: parseSchrammLogogram(logogram.schrammLogogramme),
        })
      }
      groups.set(wordId, group)
    })
  return [...groups.entries()]
    .sort(([first], [second]) => compareCleanedAkkadianString(first, second))
    .map(([wordId, group]) => ({
      wordId,
      lemma: splitWordId(wordId).lemma,
      otherWordIds: [...group.otherWordIds],
      spellings: group.spellings,
    }))
}

export function splitWordId(wordId: string): {
  lemma: string
  homonym: string
} {
  const match = wordId.match(/^(.*) ([IVX]+)$/)
  return match
    ? { lemma: match[1], homonym: match[2] }
    : { lemma: wordId, homonym: '' }
}

function cleaned(akkadian: string): string {
  return akkadian
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[ʾ'’]/g, '')
    .toLowerCase()
}

export function isSameAkkadian(first: string, second: string): boolean {
  return cleaned(first) === cleaned(second)
}
