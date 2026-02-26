import isNil from 'lodash/fp/isNil'
import reject from 'lodash/fp/reject'
import flow from 'lodash/fp/flow'
import map from 'lodash/fp/map'
import join from 'lodash/fp/join'

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

export function labelsAbbreviation(labels: Labels): string {
  return flow(
    reject(isNil),
    map(labelAbbreviation),
    join(' '),
  )([labels.object, labels.surface, labels.column])
}
