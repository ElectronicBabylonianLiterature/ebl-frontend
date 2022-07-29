import Reference from 'bibliography/domain/Reference'
import { ReferenceDto } from 'bibliography/domain/referenceDto'

export interface LineNumber {
  number: number
  hasPrime: boolean
  prefixModifier: string | null
  suffixModifier: string | null
  type?: 'LineNumber'
}

export interface OldLineNumber {
  number: string
  reference: ReferenceDto | Reference
}

export interface LineNumberRange {
  start: LineNumber
  end: LineNumber
  type: 'LineNumberRange'
}

export function isNext(
  number: LineNumber | LineNumberRange,
  other: LineNumber | LineNumberRange
): boolean {
  const first = number.type === 'LineNumberRange' ? number.end : number
  const second = other.type === 'LineNumberRange' ? other.start : other
  return (
    first.number + 1 === second.number &&
    first.hasPrime === second.hasPrime &&
    first.prefixModifier === second.prefixModifier &&
    first.suffixModifier === second.suffixModifier
  )
}
