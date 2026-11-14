import isNil from 'lodash/fp/isNil'
import reject from 'lodash/fp/reject'
import flow from 'lodash/fp/flow'
import map from 'lodash/fp/map'
import join from 'lodash/fp/join'
import { LineNumber, LineNumberRange } from 'transliteration/domain/line-number'
import { lineNumberToAtf } from 'transliteration/domain/lineNumberToString'

export function createLineAnchorId(
  labelParts: readonly string[],
  lineNumber: LineNumber | LineNumberRange,
): string {
  const prefix = labelParts.length ? `${labelParts.join(' ')} ` : ''
  return `${prefix}${lineNumberToAtf(lineNumber)}`
}

export type Status = 'PRIME' | 'UNCERTAIN' | 'CORRECTION' | 'COLLATION'

export interface Label {
  readonly status: readonly Status[]
  readonly abbreviation: string
}

export interface ColumnLabel extends Label {
  readonly column: number
}

export interface SurfaceLabel extends Label {
  readonly surface: string
  readonly text: string
}

export interface ObjectLabel extends Label {
  readonly object: string
  readonly text: string
}

export interface Labels {
  readonly object: ObjectLabel | null
  readonly surface: SurfaceLabel | null
  readonly column: ColumnLabel | null
  readonly sealNumber?: number | null
}

export const defaultLabels: Labels = {
  object: null,
  surface: null,
  column: null,
} as const

export function statusAbbreviation(status: Status): string {
  switch (status) {
    case 'PRIME':
      return "'"
    case 'UNCERTAIN':
      return '?'
    case 'CORRECTION':
      return '!'
    case 'COLLATION':
      return '*'
  }
}

export function labelAbbreviation(label: Label): string {
  return `${label.abbreviation}${label.status.map(statusAbbreviation).join('')}`
}

export function sealAbbreviation(
  sealNumber: number | null | undefined,
): string {
  return sealNumber == null ? '' : `seal ${sealNumber}`
}

export function labelsAbbreviation(labels: Labels): string {
  const abbreviation = flow(
    reject(isNil),
    map(labelAbbreviation),
    join(' '),
  )([labels.object, labels.surface, labels.column])
  const seal = sealAbbreviation(labels.sealNumber)
  return seal ? [abbreviation, seal].filter(Boolean).join(' ') : abbreviation
}
