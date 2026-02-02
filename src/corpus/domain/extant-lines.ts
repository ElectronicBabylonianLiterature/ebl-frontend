import _ from 'lodash'
import {
  isNext,
  LineNumber,
  LineNumberRange,
} from 'transliteration/domain/line-number'

export interface ExtantLine {
  readonly lineNumber: LineNumber | LineNumberRange
  readonly isSideBoundary: boolean
}

export interface ManuscriptExtantLines {
  readonly [label: string]: readonly ExtantLine[]
}

export interface ExtantLines {
  readonly [siglum: string]: ManuscriptExtantLines
}

export interface ExtantLineRange {
  readonly start: ExtantLine
  readonly end?: ExtantLine
}

function lastOf(range: ExtantLineRange): ExtantLine {
  return range.end ?? range.start
}

export function groupExtantLines(
  lines: readonly ExtantLine[],
): ExtantLineRange[] {
  return lines.reduce<ExtantLineRange[]>((ranges, line): ExtantLineRange[] => {
    const lastRange = _.last(ranges)
    return lastRange && isNext(lastOf(lastRange).lineNumber, line.lineNumber)
      ? [..._.initial(ranges), { ...lastRange, end: line }]
      : [...ranges, { start: line }]
  }, [])
}
